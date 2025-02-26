package backStudX.model;

import java.time.Instant;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.http.converter.HttpMessageNotReadableException;

@Document(collection = "message")
public class Message {

	@Id
	String id;
	String idUserSender;
	String idUserRecipient;
	String message;
	String typeMessage;
	boolean messageReaded;
	private LocalDateTime createdAt;

	public Message(String idUserSender, String idUserRecipient, String message, String typeMessage,
			boolean messageReaded) {
		this.idUserSender = idUserSender;
		this.idUserRecipient = idUserRecipient;
		this.message = message;
		this.typeMessage = typeMessage;
		this.messageReaded = messageReaded;
		this.createdAt = LocalDateTime.now(); // Se asigna la fecha actual al momento de la creación
	}

	public Message() {
		// TODO Auto-generated constructor stub
	}

	// Change property to readed message or not readed.
	public void ChangeToReadedMessage() {
		messageReaded = true;
	}

	public void ChangeToNotReadedMessage() {
		messageReaded = false;
	}

	// Getters & Setters

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getIdUserSender() {
		return idUserSender;
	}

	public void setIdUserSender(String idUserSender) {
		this.idUserSender = idUserSender;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getTypeMessage() {
		return typeMessage;
	}

	public void setTypeMessage(String typeMessage) {
		this.typeMessage = typeMessage;
	}

	public boolean isMessageReaded() {
		return messageReaded;
	}

	public void setMessageReaded(boolean messageReaded) {
		this.messageReaded = messageReaded;
	}

	public void setCreatedAt(LocalDateTime now) {
		// TODO Auto-generated method stub
		this.createdAt = now;
	}

	public String getIdUserRecipient() {
		return idUserRecipient;
	}

	public void setIdUserRecipient(String idUserRecipient) {
		this.idUserRecipient = idUserRecipient;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

}
