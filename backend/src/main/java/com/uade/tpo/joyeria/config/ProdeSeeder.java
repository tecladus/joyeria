package com.uade.tpo.joyeria.config;

import com.uade.tpo.joyeria.entity.Partido;
import com.uade.tpo.joyeria.repository.PartidoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Siembra la fase de grupos del Mundial 2026 la primera vez que arranca la app
// (si la tabla está vacía). Los administradores pueden ajustar equipos, fechas y
// resultados después; este seeder solo provee un fixture inicial completo.
@Component
@Order(20)
public class ProdeSeeder implements CommandLineRunner {

    private final PartidoRepository partidoRepository;

    public ProdeSeeder(PartidoRepository partidoRepository) {
        this.partidoRepository = partidoRepository;
    }

    // Equipo del fixture: nombre visible + código de bandera (flagcdn).
    private record Equipo(String nombre, String codigo) {}

    // 12 grupos (A..L) de 4 equipos. Distribución plausible y editable por el admin.
    private static final Equipo[][] GRUPOS = {
        { new Equipo("México", "mx"), new Equipo("Noruega", "no"), new Equipo("Ecuador", "ec"), new Equipo("Marruecos", "ma") },
        { new Equipo("Canadá", "ca"), new Equipo("Bélgica", "be"), new Equipo("Corea del Sur", "kr"), new Equipo("Túnez", "tn") },
        { new Equipo("Argentina", "ar"), new Equipo("Australia", "au"), new Equipo("Nigeria", "ng"), new Equipo("Arabia Saudita", "sa") },
        { new Equipo("Estados Unidos", "us"), new Equipo("Países Bajos", "nl"), new Equipo("Egipto", "eg"), new Equipo("Paraguay", "py") },
        { new Equipo("España", "es"), new Equipo("Japón", "jp"), new Equipo("Costa Rica", "cr"), new Equipo("Sudáfrica", "za") },
        { new Equipo("Francia", "fr"), new Equipo("Uruguay", "uy"), new Equipo("Irán", "ir"), new Equipo("Nueva Zelanda", "nz") },
        { new Equipo("Brasil", "br"), new Equipo("Croacia", "hr"), new Equipo("Camerún", "cm"), new Equipo("Panamá", "pa") },
        { new Equipo("Inglaterra", "gb-eng"), new Equipo("Senegal", "sn"), new Equipo("Polonia", "pl"), new Equipo("Catar", "qa") },
        { new Equipo("Portugal", "pt"), new Equipo("Colombia", "co"), new Equipo("Ghana", "gh"), new Equipo("Jamaica", "jm") },
        { new Equipo("Alemania", "de"), new Equipo("Suiza", "ch"), new Equipo("Costa de Marfil", "ci"), new Equipo("Honduras", "hn") },
        { new Equipo("Italia", "it"), new Equipo("Dinamarca", "dk"), new Equipo("Argelia", "dz"), new Equipo("Perú", "pe") },
        { new Equipo("Chile", "cl"), new Equipo("Suecia", "se"), new Equipo("Serbia", "rs"), new Equipo("Turquía", "tr") },
    };

    // Sedes del Mundial 2026 (se asignan de forma rotativa).
    private static final String[] SEDES = {
        "Ciudad de México", "Guadalajara", "Monterrey",
        "Toronto", "Vancouver",
        "Nueva York", "Los Ángeles", "Dallas", "Miami", "Atlanta",
        "Seattle", "Houston", "Filadelfia", "Kansas City", "San Francisco", "Boston"
    };

    // Emparejamientos round-robin para 4 equipos, agrupados por jornada (1..3).
    private static final int[][][] JORNADAS = {
        { {0, 3}, {1, 2} }, // Jornada 1
        { {0, 2}, {3, 1} }, // Jornada 2
        { {0, 1}, {2, 3} }, // Jornada 3
    };

    // Día base (junio 2026) de cada jornada.
    private static final int[] DIA_BASE_JORNADA = {11, 18, 24};

    @Override
    public void run(String... args) {
        if (partidoRepository.count() > 0) {
            return; // Ya sembrado: no duplicar.
        }

        List<Partido> partidos = new ArrayList<>();
        int sedeIdx = 0;

        for (int g = 0; g < GRUPOS.length; g++) {
            Equipo[] equipos = GRUPOS[g];
            String grupo = String.valueOf((char) ('A' + g));

            for (int j = 0; j < JORNADAS.length; j++) {
                int jornada = j + 1;
                int dia = DIA_BASE_JORNADA[j] + (g / 2); // escalona los grupos en el calendario
                int[][] pares = JORNADAS[j];

                for (int m = 0; m < pares.length; m++) {
                    Equipo local = equipos[pares[m][0]];
                    Equipo visitante = equipos[pares[m][1]];
                    int hora = (m == 0) ? 16 : 19;

                    Partido partido = new Partido();
                    partido.setFase("GRUPOS");
                    partido.setGrupo(grupo);
                    partido.setJornada(jornada);
                    partido.setEquipoLocal(local.nombre());
                    partido.setCodigoLocal(local.codigo());
                    partido.setEquipoVisitante(visitante.nombre());
                    partido.setCodigoVisitante(visitante.codigo());
                    partido.setFechaPartido(LocalDateTime.of(2026, 6, dia, hora, 0));
                    partido.setSede(SEDES[sedeIdx % SEDES.length]);
                    partido.setFinalizado(false);

                    partidos.add(partido);
                    sedeIdx++;
                }
            }
        }

        partidoRepository.saveAll(partidos);
        System.out.println("[ProdeSeeder] Fixture del Mundial sembrado: " + partidos.size() + " partidos.");
    }
}
