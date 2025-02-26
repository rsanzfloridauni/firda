package backStudX.Services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import backStudX.model.Message;
import backStudX.repository.MessageRepository;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    // 1. Obtener conversaciones recientes del usuario
    public List<Message> getLastMessagesByUser(String idUser) {
        return messageRepository.findLastMessagesByUser(idUser);
    }

    // 2. Obtener los mensajes entre dos usuarios
    public List<Message> getMessagesWithUser(String idUser1, String idUser2) {
        return messageRepository.findByUsers(idUser1, idUser2, Sort.by("createdAt"));
    }

    // 3. Enviar un mensaje
    public Message sendMessage(Message message) {
        message.setCreatedAt(LocalDateTime.now());
        message.setMessageReaded(false);
        return messageRepository.save(message);
    }

    // 4. Marcar como leído
    public void markMessagesAsRead(String idUserSender, String idUserRecipient) {
        List<Message> messages = messageRepository.findUnreadMessages(idUserSender, idUserRecipient);
        messages.forEach(m -> m.setMessageReaded(true));
        messageRepository.saveAll(messages);
    }
    
    public List<Message> getLastMessagesGroupedByUser(String idUser) {
        List<Message> allMessages = messageRepository.findLastMessagesByUser(idUser);

        Map<String, Message> lastMessagesMap = new HashMap<>();

        for (Message message : allMessages) {
            String chatPartnerId = message.getIdUserSender().equals(idUser)
                    ? message.getIdUserRecipient()
                    : message.getIdUserSender();

            // Solo guarda el primer mensaje que encuentra, ya que está ordenado por fecha DESC
            if (!lastMessagesMap.containsKey(chatPartnerId)) {
                lastMessagesMap.put(chatPartnerId, message);
            }
        }

        return new ArrayList<>(lastMessagesMap.values());
    }
}
