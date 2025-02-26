package backStudX;

import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;

public class SendEmail {
    public static void sendMail(String username, String password, String recipient) {
        // Configurar las propiedades del servidor SMTP
        String host = "smtp.gmail.com"; // Usando Gmail
        String port = "587"; // Puerto SMTP para Gmail 

        // Configurar las propiedades de la conexión
        Properties properties = new Properties();
        properties.put("mail.smtp.host", host);
        properties.put("mail.smtp.port", port);
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true"); // Para cifrado TLS

        // Autenticación
        Session session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            // Crear el mensaje de correo
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipient));
            message.setSubject("Contraseña de recuperacion");
            message.setText("Contrasenaaa");

            // Enviar el correo
            Transport.send(message);
            System.out.println("Correo enviado exitosamente.");

        } catch (MessagingException e) {
            e.printStackTrace();
            System.out.println("Error al enviar el correo.");
        }
    }
}