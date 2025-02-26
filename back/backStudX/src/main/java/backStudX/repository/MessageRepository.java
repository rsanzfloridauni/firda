package backStudX.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import backStudX.model.Message;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    // 1. Obtener las últimas conversaciones con cada usuario
    @Query("{ $or: [ { 'idUserSender': ?0 }, { 'idUserRecipient': ?0 } ] }")
    List<Message> findMessagesByUser(String idUser);

    // 2. Obtener mensajes entre dos usuarios ordenados por fecha
    @Query("{ $or: [ { 'idUserSender': ?0, 'idUserRecipient': ?1 }, { 'idUserSender': ?1, 'idUserRecipient': ?0 } ] }")
    List<Message> findByUsers(String idUser1, String idUser2, Sort sort);

    // 3. Obtener mensajes no leídos de un usuario hacia otro
    @Query("{ 'idUserSender': ?0, 'idUserRecipient': ?1, 'messageReaded': false }")
    List<Message> findUnreadMessages(String idUserSender, String idUserRecipient);
    
    @Query("""
    	    SELECT m FROM Message m
    	    WHERE m.idUserSender = :idUser OR m.idUserRecipient = :idUser
    	    ORDER BY m.createdAt DESC
    	    """)
    	List<Message> findLastMessagesByUser(@Param("idUser") String idUser);

}
