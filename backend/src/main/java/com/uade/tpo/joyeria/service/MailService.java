package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.entity.Orden;
import com.uade.tpo.joyeria.entity.DetalleOrden;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class MailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private void enviarHtml(String destinatario, String asunto, String cuerpoHtml) {
        log.info("Intento de envío de email a: {} | Asunto: {}", destinatario, asunto);
        if (mailSender == null) {
            log.warn("JavaMailSender no está configurado. Fallback a consola.");
            mostrarEmailEnConsola(destinatario, asunto, cuerpoHtml);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // true = HTML
            mailSender.send(message);
            log.info("Email enviado exitosamente a {}", destinatario);
        } catch (Exception e) {
            log.error("Error al enviar email a {}: {}. Fallback a consola.", destinatario, e.getMessage());
            mostrarEmailEnConsola(destinatario, asunto, cuerpoHtml);
        }
    }

    private void mostrarEmailEnConsola(String destinatario, String asunto, String cuerpoHtml) {
        System.out.println("=========================================================================");
        System.out.println("SIMULACIÓN DE ENVÍO DE EMAIL (SMTP NO CONFIGURADO O FALLIDO)");
        System.out.println("Destinatario: " + destinatario);
        System.out.println("Asunto: " + asunto);
        System.out.println("Cuerpo HTML:");
        System.out.println(cuerpoHtml);
        System.out.println("=========================================================================");
    }

    public void enviarCorreoBienvenida(String email, String nombre) {
        String asunto = "Bienvenido a Aureum - Joyería Exclusiva";
        String cuerpo = "<html>" +
                "<body style='font-family: \"Outfit\", \"Inter\", sans-serif; background-color: #faf9f7; color: #1a1a1a; padding: 40px; margin: 0;'>" +
                "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #e5e5e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);'>" +
                "    <div style='text-align: center; margin-bottom: 30px;'>" +
                "      <h1 style='font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; color: #111; text-transform: uppercase;'>AUREUM</h1>" +
                "      <p style='font-size: 11px; letter-spacing: 2px; color: #8a7355; margin: 5px 0 0 0; text-transform: uppercase;'>High Jewelry</p>" +
                "    </div>" +
                "    <hr style='border: 0; border-top: 1px solid #eaeaea; margin-bottom: 30px;' />" +
                "    <p style='font-size: 16px; line-height: 1.6; font-weight: 300;'>Hola, " + nombre + ",</p>" +
                "    <p style='font-size: 16px; line-height: 1.6; font-weight: 300;'>" +
                "      Es un honor darle la bienvenida a <strong>Aureum</strong>. A partir de ahora, usted forma parte de nuestra distinguida clientela, con acceso a piezas de joyería exclusivas diseñadas con la máxima precisión, metales preciosos y gemas seleccionadas meticulosamente." +
                "    </p>" +
                "    <p style='font-size: 16px; line-height: 1.6; font-weight: 300;'>" +
                "      Explore nuestras colecciones atemporales y descubra la perfecta armonía entre el diseño contemporáneo y la alta orfebrería." +
                "    </p>" +
                "    <div style='text-align: center; margin: 40px 0;'>" +
                "      <a href='https://joyeria.webexolink.com' style='background-color: #111111; color: #ffffff; text-decoration: none; padding: 12px 30px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; border-radius: 4px; font-weight: 400; display: inline-block;'>Descubrir Colecciones</a>" +
                "    </div>" +
                "    <p style='font-size: 14px; line-height: 1.6; font-weight: 300; color: #666;'>" +
                "      Si tiene alguna consulta o desea un asesoramiento personalizado para una pieza a medida, no dude en contactarnos a través de nuestra sección de atención al cliente." +
                "    </p>" +
                "    <hr style='border: 0; border-top: 1px solid #eaeaea; margin-top: 40px; margin-bottom: 20px;' />" +
                "    <div style='text-align: center; font-size: 12px; color: #999; font-weight: 300;'>" +
                "      <p style='margin: 5px 0;'>AUREUM &copy; 2026. Todos los derechos reservados.</p>" +
                "      <p style='margin: 5px 0;'>Atención Exclusiva | Buenos Aires, Argentina</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
        enviarHtml(email, asunto, cuerpo);
    }

    public void enviarFormularioContacto(String emailContacto, String nombre, String asunto, String mensaje) {
        String asuntoCorreo = "Contacto Aureum: " + asunto;
        String cuerpo = "<html>" +
                "<body style='font-family: \"Outfit\", \"Inter\", sans-serif; background-color: #faf9f7; color: #1a1a1a; padding: 40px; margin: 0;'>" +
                "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #e5e5e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);'>" +
                "    <div style='text-align: center; margin-bottom: 30px;'>" +
                "      <h1 style='font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; color: #111; text-transform: uppercase;'>AUREUM</h1>" +
                "      <p style='font-size: 11px; letter-spacing: 2px; color: #8a7355; margin: 5px 0 0 0; text-transform: uppercase;'>Contacto Recibido</p>" +
                "    </div>" +
                "    <hr style='border: 0; border-top: 1px solid #eaeaea; margin-bottom: 30px;' />" +
                "    <p style='font-size: 16px; line-height: 1.6; font-weight: 300;'>Se ha recibido un nuevo mensaje de contacto:</p>" +
                "    <div style='background-color: #f7f7f5; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 3px solid #8a7355;'>" +
                "      <p style='margin: 0 0 10px 0; font-size: 14px;'><strong>Nombre:</strong> " + nombre + "</p>" +
                "      <p style='margin: 0 0 10px 0; font-size: 14px;'><strong>Email:</strong> " + emailContacto + "</p>" +
                "      <p style='margin: 0 0 10px 0; font-size: 14px;'><strong>Asunto:</strong> " + asunto + "</p>" +
                "      <p style='margin: 0; font-size: 14px; white-space: pre-wrap;'><strong>Mensaje:</strong><br/>" + mensaje + "</p>" +
                "    </div>" +
                "    <p style='font-size: 14px; line-height: 1.6; font-weight: 300; color: #666;'>" +
                "      Este correo ha sido generado automáticamente por el sistema de contacto de la joyería Aureum." +
                "    </p>" +
                "    <hr style='border: 0; border-top: 1px solid #eaeaea; margin-top: 40px; margin-bottom: 20px;' />" +
                "    <div style='text-align: center; font-size: 12px; color: #999; font-weight: 300;'>" +
                "      <p style='margin: 5px 0;'>AUREUM &copy; 2026. Todos los derechos reservados.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
        
        enviarHtml(emailContacto, "Hemos recibido su mensaje - Aureum", cuerpo);
    }

    public void enviarConfirmacionCompra(String email, Orden orden) {
        String asunto = "Confirmación de Compra - Orden #" + orden.getIdOrden() + " | Aureum";
        
        StringBuilder itemsHtml = new StringBuilder();
        for (DetalleOrden detalle : orden.getDetalles()) {
            BigDecimal subtotal = detalle.getPrecioUnitario().multiply(new BigDecimal(detalle.getCantidad()));
            itemsHtml.append("<tr>")
                    .append("<td style='padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 300; font-size: 14px;'>")
                    .append(detalle.getProducto().getNombre())
                    .append("</td>")
                    .append("<td style='padding: 12px 0; border-bottom: 1px solid #eee; text-align: center; font-weight: 300; font-size: 14px;'>")
                    .append(detalle.getCantidad())
                    .append("</td>")
                    .append("<td style='padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 300; font-size: 14px;'>$")
                    .append(detalle.getPrecioUnitario())
                    .append("</td>")
                    .append("<td style='padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 400; font-size: 14px;'>$")
                    .append(subtotal)
                    .append("</td>")
                    .append("</tr>");
        }

        String cuerpo = "<html>" +
                "<body style='font-family: \"Outfit\", \"Inter\", sans-serif; background-color: #faf9f7; color: #1a1a1a; padding: 40px; margin: 0;'>" +
                "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #e5e5e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);'>" +
                "    <div style='text-align: center; margin-bottom: 30px;'>" +
                "      <h1 style='font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; color: #111; text-transform: uppercase;'>AUREUM</h1>" +
                "      <p style='font-size: 11px; letter-spacing: 2px; color: #8a7355; margin: 5px 0 0 0; text-transform: uppercase;'>Confirmación de Pedido</p>" +
                "    </div>" +
                "    <hr style='border: 0; border-top: 1px solid #eaeaea; margin-bottom: 30px;' />" +
                "    <p style='font-size: 16px; line-height: 1.6; font-weight: 300;'>Estimado/a " + orden.getNombreCompleto() + ",</p>" +
                "    <p style='font-size: 16px; line-height: 1.6; font-weight: 300;'>" +
                "      Agradecemos su compra en Aureum. Confirmamos que su pedido ha sido recibido y está siendo procesado con la dedicación que nos caracteriza." +
                "    </p>" +
                "    <h3 style='font-size: 16px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; margin-top: 30px; color: #111;'>Detalles del Pedido</h3>" +
                "    <p style='font-size: 14px; color: #666; margin: 5px 0;'><strong>Orden #:</strong> " + orden.getIdOrden() + "</p>" +
                "    <p style='font-size: 14px; color: #666; margin: 5px 0;'><strong>Fecha:</strong> " + orden.getFecha() + "</p>" +
                "    <p style='font-size: 14px; color: #666; margin: 5px 0;'><strong>Estado:</strong> " + orden.getEstado() + "</p>" +
                "    <p style='font-size: 14px; color: #666; margin: 5px 0;'><strong>Método de Pago:</strong> " + orden.getMetodoPago() + "</p>" +
                "    <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>" +
                "      <thead>" +
                "        <tr style='border-bottom: 2px solid #eaeaea;'>" +
                "          <th style='text-align: left; padding: 8px 0; font-weight: 400; font-size: 12px; text-transform: uppercase; color: #888;'>Producto</th>" +
                "          <th style='text-align: center; padding: 8px 0; font-weight: 400; font-size: 12px; text-transform: uppercase; color: #888;'>Cant.</th>" +
                "          <th style='text-align: right; padding: 8px 0; font-weight: 400; font-size: 12px; text-transform: uppercase; color: #888;'>Unitario</th>" +
                "          <th style='text-align: right; padding: 8px 0; font-weight: 400; font-size: 12px; text-transform: uppercase; color: #888;'>Subtotal</th>" +
                "        </tr>" +
                "      </thead>" +
                "      <tbody>" +
                itemsHtml.toString() +
                "      </tbody>" +
                "    </table>" +
                "    <div style='text-align: right; font-size: 18px; font-weight: 300; margin-top: 20px;'>" +
                "      Total de la Compra: <span style='font-weight: 400; color: #8a7355;'>$" + orden.getTotal() + "</span>" +
                "    </div>" +
                "    <h3 style='font-size: 16px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; margin-top: 30px; color: #111;'>Detalles de Envío</h3>" +
                "    <div style='background-color: #f7f7f5; padding: 20px; border-radius: 4px; font-size: 14px; line-height: 1.6; font-weight: 300; color: #444;'>" +
                "      <p style='margin: 0 0 5px 0;'><strong>Dirección:</strong> " + orden.getDireccion() + "</p>" +
                "      <p style='margin: 0 0 5px 0;'><strong>Ciudad:</strong> " + orden.getCiudad() + "</p>" +
                "      <p style='margin: 0 0 5px 0;'><strong>Código Postal:</strong> " + orden.getCodigoPostal() + "</p>" +
                "      <p style='margin: 0;'><strong>Teléfono:</strong> " + orden.getTelefono() + "</p>" +
                "    </div>" +
                "    <p style='font-size: 14px; line-height: 1.6; font-weight: 300; color: #666; margin-top: 30px;'>" +
                "      Una vez que su pedido sea despachado, recibirá un nuevo aviso con los datos de seguimiento." +
                "    </p>" +
                "    <hr style='border: 0; border-top: 1px solid #eaeaea; margin-top: 40px; margin-bottom: 20px;' />" +
                "    <div style='text-align: center; font-size: 12px; color: #999; font-weight: 300;'>" +
                "      <p style='margin: 5px 0;'>AUREUM &copy; 2026. Todos los derechos reservados.</p>" +
                "      <p style='margin: 5px 0;'>Si tiene dudas sobre su compra, responda a este correo o contáctenos por la web.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
        enviarHtml(email, asunto, cuerpo);
    }

    public void enviarCorreoPrueba(String email, String nombre) {
        String asunto = "Prueba de Conexión de Correo - Aureum";
        String cuerpo = "<html>" +
                "<body style='font-family: \"Outfit\", \"Inter\", sans-serif; background-color: #faf9f7; color: #1a1a1a; padding: 40px; margin: 0;'>" +
                "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #e5e5e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);'>" +
                "    <div style='text-align: center; margin-bottom: 30px;'>" +
                "      <h1 style='font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; color: #111; text-transform: uppercase;'>AUREUM</h1>" +
                "      <p style='font-size: 11px; letter-spacing: 2px; color: #8a7355; margin: 5px 0 0 0; text-transform: uppercase;'>Prueba del Sistema</p>" +
                "    </div>" +
                "    <hr style='border: 0; border-top: 1px solid #eaeaea; margin-bottom: 30px;' />" +
                "    <p style='font-size: 16px; line-height: 1.6; font-weight: 300;'>Hola, " + nombre + ",</p>" +
                "    <p style='font-size: 16px; line-height: 1.6; font-weight: 300;'>" +
                "      Este es un correo de prueba enviado desde la plataforma <strong>Aureum Joyería</strong>." +
                "    </p>" +
                "    <p style='font-size: 16px; line-height: 1.6; font-weight: 300; color: #8a7355;'>" +
                "      Si está leyendo este mensaje, su configuración de servidor de correo SMTP está funcionando correctamente." +
                "    </p>" +
                "    <hr style='border: 0; border-top: 1px solid #eaeaea; margin-top: 40px; margin-bottom: 20px;' />" +
                "    <div style='text-align: center; font-size: 12px; color: #999; font-weight: 300;'>" +
                "      <p style='margin: 5px 0;'>AUREUM &copy; 2026. Todos los derechos reservados.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
        enviarHtml(email, asunto, cuerpo);
    }
}
