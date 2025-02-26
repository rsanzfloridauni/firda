package backStudX.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tokens")
public class Token {

	@Id
	private String id;
	String userId;
	private String token;
	private Instant expirationDate;

	public Token(String userId,String token, Instant expirationDate) {
		this.userId = userId;
		this.token = token;
		this.expirationDate = expirationDate;
	}

	// Getters & setters
	public Instant getExpirationDate() {
		return expirationDate;
	}

	public void setExpirationDate(Instant expirationDate) {
		this.expirationDate = expirationDate;
	}
	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}
	
	public boolean isExpired() {
	    return expirationDate != null && Instant.now().isAfter(expirationDate);
	}
}
