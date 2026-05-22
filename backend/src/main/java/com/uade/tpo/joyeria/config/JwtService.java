package com.uade.tpo.joyeria.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

// Responsable de crear y validar tokens JWT.
// Estructura del token: header.payload.firma
//   payload contiene: email (subject), rol, fecha de emision y expiracion.
//   La firma garantiza que nadie puede modificar el token sin que lo detectemos.
@Service
public class JwtService {

    // Clave secreta y expiracion vienen de application.properties, nunca hardcodeadas.
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expiration;

    @PostConstruct
    public void init() {
        if (secretKey == null || secretKey.trim().isEmpty()) {
            // Generate a secure random key for development
            byte[] randomKeyBytes = new byte[32];
            new SecureRandom().nextBytes(randomKeyBytes);
            this.secretKey = Base64.getEncoder().encodeToString(randomKeyBytes);
            System.out.println("=========================================================================");
            System.out.println("WARNING: JWT_SECRET environment variable is not configured.");
            System.out.println("A temporary 256-bit cryptographically secure key has been generated.");
            System.out.println("All active sessions will be invalidated if the server restarts.");
            System.out.println("=========================================================================");
        } else if (secretKey.getBytes().length < 32) {
            throw new IllegalArgumentException("JWT_SECRET must be at least 256 bits (32 bytes) long! The configured key is too short.");
        }
    }


    // Extrae el email del subject del token. Usado por JwtAuthenticationFilter en cada request.
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Metodo generico para extraer cualquier claim del token.
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Genera el token JWT con el rol del usuario como claim extra.
    // El rol va dentro del token para no tener que consultar la BD en cada request.
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("roles", userDetails.getAuthorities());
        return buildToken(extraClaims, userDetails);
    }

    // Construye el token: claims + subject (email) + fechas + firma con clave secreta.
    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Valida que el email del token coincida con el usuario y que no este vencido.
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // Compara la fecha de expiracion del token con la fecha actual.
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    // Parsea el token y extrae todos los claims. Si fue alterado, jjwt lanza excepcion automaticamente.
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Convierte la clave secreta (String) en un objeto Key criptografico compatible con HS256.
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
}
