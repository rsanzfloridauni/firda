package backStudX.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "groups")
public class Group {
	
	@Id
	String id;
	String name;
	int languajeLevel;
	int quantity;
	String languaje;
	String userId;


	public Group(String name, int languajeLevel, int quantity, String languaje,String userId) {
		this.name = name;
		this.languajeLevel = languajeLevel;
		this.quantity = quantity;
		this.languaje = languaje;
		this.userId = userId;
	}


	public String getId() {
		return id;
	}


	public void setId(String id) {
		this.id = id;
	}


	public String getName() {
		return name;
	}


	public void setName(String name) {
		this.name = name;
	}


	public int getLanguajeLevel() {
		return languajeLevel;
	}


	public void setLanguajeLevel(int languajeLevel) {
		this.languajeLevel = languajeLevel;
	}


	public int getQuantity() {
		return quantity;
	}


	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}


	public String getLanguaje() {
		return languaje;
	}


	public void setLanguaje(String languaje) {
		this.languaje = languaje;
	}
	
	public String getUserId() {
		return userId;
	}


	public void setUserId(String userId) {
		this.userId = userId;
	}
	
	

}
