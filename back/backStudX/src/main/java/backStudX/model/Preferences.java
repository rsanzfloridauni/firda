package backStudX.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "userPreferences")
public class Preferences {

	@Id
	String id;
	String userId;
	boolean darkMode;
	boolean notifications;
	String language;

	public Preferences(String userId, boolean darkmode, boolean notifications, String languaje) {
		this.userId = userId;
		this.darkMode = darkmode;
		this.notifications = notifications;
		this.language = languaje;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public boolean isDarkMode() {
		return darkMode;
	}

	public void setDarkMode(boolean darkMode) {
		this.darkMode = darkMode;
	}

	public boolean isNotifications() {
		return notifications;
	}

	public void setNotifications(boolean notifications) {
		this.notifications = notifications;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

}
