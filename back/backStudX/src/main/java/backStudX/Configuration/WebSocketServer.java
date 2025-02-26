package backStudX.Configuration;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import backStudX.controller.Controller;
import backStudX.model.Message;
import backStudX.repository.MessageRepository;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import org.json.JSONObject;

@jakarta.websocket.server.ServerEndpoint("/ws")
@Component
public class WebSocketServer {

    private static final Map<String, Session> userSessions = new HashMap<>();

    @jakarta.websocket.OnMessage
    public void onMessage(String message, Session session) {
        try {
            // Parsear el mensaje recibido como JSON
            JSONObject jsonMessage = new JSONObject(message);

            // Obtener el ID del remitente y del receptor
            String senderUserId = jsonMessage.getString("senderUserId");
            String recipientUserId = jsonMessage.getString("recipientUserId");

            // Crear el objeto de mensaje en base a los datos del JSON
            Message newMessage = new Message();
            newMessage.setMessage(message);
            newMessage.setIdUserSender(senderUserId); // Usar el ID del remitente
            newMessage.setIdUserRecipient(recipientUserId); // Usar el ID del receptor
            newMessage.setMessageReaded(false);
            newMessage.setCreatedAt(LocalDateTime.now());
            newMessage.setTypeMessage("text"); // Asumimos que es texto, pero puede ser diferente

            // Enviar el mensaje al receptor
            sendMessageToRecipient(recipientUserId, message);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error al procesar el mensaje: " + e.getMessage());
        }
    }

    private void sendMessageToRecipient(String recipientUserId, String message) {
        Session recipientSession = userSessions.get(recipientUserId);
        if (recipientSession != null) {
            try {
                // Enviar el mensaje al receptor
                recipientSession.getBasicRemote().sendText(message);
                System.out.println("Mensaje enviado a " + recipientUserId);
            } catch (IOException e) {
                System.out.println("Error al enviar mensaje WebSocket: " + e.getMessage());
            }
        } else {
            System.out.println("El usuario " + recipientUserId + " no está conectado.");
        }
    }

    public static Map<String, Session> getUserSessions() {
        return userSessions;
    }

    @OnOpen
    public void onOpen(Session session) {
        Map<String, List<String>> requestParams = session.getRequestParameterMap();
        List<String> userIdList = requestParams.get("userId");

        if (userIdList != null && !userIdList.isEmpty()) {
            String userId = userIdList.get(0); // Obtener el ID del usuario de la lista
            userSessions.put(userId, session);
            System.out.println("Conexión abierta: " + session.getId() + " para el usuario: " + userId);
        } else {
            System.out.println("No se encontró el parámetro 'userId' al abrir la sesión.");
            try {
                session.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    // Método para eliminar la sesión cuando se cierra la conexión
    @OnClose
    public void onClose(Session session) {
        userSessions.entrySet().removeIf(entry -> entry.getValue().equals(session));
        System.out.println("Conexión cerrada: " + session.getId());
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.out.println("Error en WebSocket: " + throwable.getMessage());
    }
}
