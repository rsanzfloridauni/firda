package backStudX.controller;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.apache.catalina.connector.Response;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import backStudX.SendEmail;

import backStudX.Util;
import backStudX.Services.CloudinaryService;
import backStudX.Services.ExchangeService;
import backStudX.Services.MessageService;
import backStudX.model.Exchange;
import backStudX.model.Group;
import backStudX.model.Token;
import backStudX.model.User;
import backStudX.model.Message;
import backStudX.model.Preferences;
import backStudX.repository.ExchangeRepository;
import backStudX.repository.GroupRepository;
import backStudX.repository.MessageRepository;
import backStudX.repository.PreferencesRepository;
import backStudX.repository.TokenRepository;
import backStudX.repository.UserRepository;

@RestController
public class Controller {

	@Autowired
	UserRepository userRepository;

	@Autowired
	TokenRepository tokenRepository;

	@Autowired
	ExchangeRepository exchangeRepository;

	@Autowired
	GroupRepository groupRepository;

	@Autowired
	PreferencesRepository preferencesRepository;

	@Autowired
	private ExchangeService exchangeService;

	@Autowired
	private CloudinaryService cloudinaryService;
	
	@Autowired MessageService messageService;
	
	@Autowired MessageRepository messageRepository;

	@PostMapping("/api/auth/register")
	ResponseEntity<String> registerUser(@RequestBody String userData) {
		JSONObject newUserObject = new JSONObject(userData);

		String emailNewUser = (String) newUserObject.get("email");
		User userWithSameMail = userRepository.findUserMail(emailNewUser);

		if (userWithSameMail != null) {

			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		} else {
			String name = newUserObject.getString("name");
			String passwd = newUserObject.getString("password");
			String hashedPassword = Util.hashPassword(passwd);
			String university = newUserObject.getString("university");
			User newUser = new User(name, emailNewUser, hashedPassword, university);
			userRepository.save(newUser);
			return ResponseEntity.status(HttpStatus.ACCEPTED).build();
		}

	}

	@PostMapping("/api/auth/login")
	ResponseEntity<String> loginUser(@RequestBody String userData) {
		JSONObject newUserObject = new JSONObject(userData);

		String emailUser = (String) newUserObject.get("email");
		String passwordUser = (String) newUserObject.get("password");

		User u = userRepository.findUserMail(emailUser);

		if (u != null) {
			if (Util.verifyPassword(passwordUser, u.getHashPasswd())) {
				String token = UUID.randomUUID().toString();
				Token t = new Token(emailUser, token, Instant.now().plus(7, ChronoUnit.DAYS));
				tokenRepository.save(t);
				return ResponseEntity.status(HttpStatus.OK).body(token);
			} else {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			}
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

	}

	@PostMapping("/api/auth/loginWithToken")
	ResponseEntity<String> loginWithToken(@RequestBody String userData) {
		JSONObject newUserObject = new JSONObject(userData);

		String emailUser = (String) newUserObject.get("email");
		String token = (String) newUserObject.get("token");

		Token t = tokenRepository.findToken(token);
		if (t != null && t.getUserId().equals(emailUser) && !t.isExpired()) {
			return ResponseEntity.status(HttpStatus.OK).build();
		}

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

	}

	@PostMapping("/api/auth/logout")
	ResponseEntity<String> logoutUser(@RequestBody String userData) {

		JSONObject newUserObject = new JSONObject(userData);
		String email = newUserObject.getString("email");
		String token = newUserObject.getString("token");
		Token t = tokenRepository.findToken(token);
		if (t == null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		} else {
			tokenRepository.delete(t);

			return ResponseEntity.status(HttpStatus.OK).build();
		}

	}

	@RequestMapping("/api/users/me")
	ResponseEntity<String> me(@RequestParam(value = "token") String token) {

		Token t = tokenRepository.findToken(token);
		if (t != null) {
			User u = userRepository.findUserMail(t.getUserId());
			JSONObject userInJson = new JSONObject();
			userInJson.put("email", u.getEmail());
			userInJson.put("name", u.getName());
			userInJson.put("password", u.getHashPasswd());
			userInJson.put("university", u.getUniversity());
			userInJson.put("urlProfilePicture", u.getUrlProfilePicture());
			userInJson.put("urlHeaderPicture", u.getUrlHeaderPicture());
			return ResponseEntity.status(HttpStatus.OK).body(userInJson.toString());
		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
	}
	

	@PostMapping("/api/auth/forgotPassword")
	public ResponseEntity<String> forgotPassword(@RequestBody String userMail) {
		String content = "";
		try {
			// Accedemos al archivo pw.json desde el classpath
			InputStream inputStream = getClass().getClassLoader().getResourceAsStream("pw.json");

			if (inputStream == null) {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
						.body("No se encontró el archivo de credenciales.");
			}

			// Leemos el contenido del archivo
			content = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

		} catch (IOException e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}

		if (!content.isEmpty()) {
			JSONObject mailCredentials = new JSONObject(content);
			String email = mailCredentials.getString("mail");
			String password = mailCredentials.getString("psw");

			if (!userMail.isEmpty()) {
				SendEmail.sendMail(email, password, userMail);
				return ResponseEntity.status(HttpStatus.OK).build();
			}
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

	}

	@PostMapping("/api/auth/reset-password")
	ResponseEntity<String> resetPassword() {

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
	}

	@PostMapping("/api/exchanges")
	ResponseEntity<String> createExchange(@RequestBody String exchange) {

		try {
			JSONObject objectExchange = new JSONObject(exchange);

			String token = objectExchange.getString("token");
			Token t = tokenRepository.findToken(token);
			if (t != null && !t.isExpired()) {
				String nativeLanguage = objectExchange.getString("nativeLanguage");
				String targetLanguage = objectExchange.getString("targetLanguage");
				String educationalLevel = objectExchange.getString("educationalLevel");
				String academicLevel = objectExchange.getString("academicLevel");

				String idTeacherCreator = t.getUserId();

				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
				LocalDate beginDate = LocalDate.parse(objectExchange.getString("beginDate"), formatter);
				LocalDate endDate = LocalDate.parse(objectExchange.getString("endDate"), formatter);

				Date beginDateMongo = Date.from(beginDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
				Date endDateMongo = Date.from(endDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

				int quantityStudents = objectExchange.getInt("quantityStudents");
				String university = objectExchange.getString("university");

				// Crear el objeto Exchange
				Exchange newExchange = new Exchange(nativeLanguage, targetLanguage, educationalLevel, academicLevel,
						idTeacherCreator, beginDateMongo, endDateMongo, quantityStudents, university, "pending");

				exchangeRepository.save(newExchange);

				return ResponseEntity.status(HttpStatus.CREATED).build();
			} else {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
			}

		} catch (Exception e) {
			// Manejo de excepciones
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("Error al procesar la solicitud: " + e.getMessage());
		}
	}

	@RequestMapping("/api/exchanges")
	public ResponseEntity<List<Exchange>> getExchanges(@RequestParam(required = false) String nativeLanguage,
			@RequestParam(required = false) String targetLanguage,
			@RequestParam(required = false) String educationalLevel,
			@RequestParam(required = false) String academicLevel,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date beginDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate,
			@RequestParam(required = false) Integer quantityStudentsMin,
			@RequestParam(required = false) Integer quantityStudentsMax,
			@RequestParam(required = false) String university,@RequestParam(required = false) String userId,
			@RequestParam(required = false) String status) {

		List<Exchange> exchanges = exchangeService.searchExchanges(nativeLanguage, targetLanguage, educationalLevel,
				academicLevel, beginDate, endDate, quantityStudentsMin, quantityStudentsMax, university,userId);

		return ResponseEntity.ok(exchanges);
	}

	@RequestMapping("/api/exchanges/")
	public ResponseEntity<Optional<Exchange>> getExchangeById(@RequestParam(required = true) String exchangeId) {

		return ResponseEntity.ok().body(exchangeRepository.findById(exchangeId));
	}

	 private Date convertLocalDateTimeToDate(LocalDateTime localDateTime) {
	        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
	    }
	
	@GetMapping("/api/messages")
	public ResponseEntity<Map<String, Object>> getUserChats(
	        @RequestParam(value = "token") String token) {

	    // Validar el token y obtener el usuario
	    Token t = tokenRepository.findToken(token);
	    if (t == null || t.isExpired()) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
	    }

	    String idUser = t.getUserId(); // Sacamos el idUser directamente del token

	    User loggedUser = userRepository.findUserMail(idUser);

	    List<Message> lastMessagesByUser = messageService.getLastMessagesGroupedByUser(idUser);

	    if (lastMessagesByUser.isEmpty()) {
	        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	    }

	    List<Map<String, Object>> chats = new ArrayList<>();

	    for (Message message : lastMessagesByUser) {
	        // Comprobar quién es el otro usuario en el chat (puede ser sender o receiver)
	        String otherUserId = message.getIdUserSender().equals(idUser) ? message.getIdUserRecipient() : message.getIdUserSender();

	        User otherUser = userRepository.findUserMail(otherUserId);
	        if (otherUser == null) {
	            continue;
	        }

	        // Construir la info del chat
	        Map<String, Object> chatInfo = new HashMap<>();
	        chatInfo.put("userId", otherUser.getEmail());
	        chatInfo.put("userName", otherUser.getName());
	        chatInfo.put("userProfilePicture", otherUser.getUrlProfilePicture());
	        chatInfo.put("lastMessage", message.getMessage());
	        chatInfo.put("lastMessageDate", convertLocalDateTimeToDate(message.getCreatedAt()));

	        chats.add(chatInfo);
	    }

	    // Ordenar los chats por la fecha del último mensaje (de más reciente a más antiguo)
	    chats.sort((chat1, chat2) -> {
	        Date date1 = (Date) chat1.get("lastMessageDate");
	        Date date2 = (Date) chat2.get("lastMessageDate");
	        return date2.compareTo(date1); // Ordenar de más reciente a más antiguo
	    });

	    // Construir la respuesta final
	    Map<String, Object> response = new HashMap<>();
	    response.put("loggedUser", Map.of(
	            "email", loggedUser.getEmail(),
	            "name", loggedUser.getName(),
	            "urlProfilePicture", loggedUser.getUrlProfilePicture(),
	            "urlHeaderPicture", loggedUser.getUrlHeaderPicture()
	    ));
	    response.put("chats", chats);

	    return ResponseEntity.ok(response);
	}



	
	@PostMapping("/api/messages")
	public ResponseEntity<?> sendMessage(@RequestBody String body) {
	    try {
	        JSONObject msj = new JSONObject(body);

	        String idUserSender = msj.getString("idUserSender");
	        String idUserRecipient = msj.getString("idUserRecipient");
	        String message = msj.getString("message");
	        String typeMessage = msj.optString("typeMessage", "text"); // Por defecto "text"
	        String token = msj.getString("token");

	        // Validar token
	        Token t = tokenRepository.findToken(token);
	        if (t == null || t.isExpired()) {
	            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token inválido o expirado");
	        }

	        // Crear mensaje
	        Message newMessage = new Message();
	        newMessage.setIdUserSender(idUserSender);
	        newMessage.setIdUserRecipient(idUserRecipient);
	        newMessage.setMessage(message);
	        newMessage.setTypeMessage(typeMessage);
	        newMessage.setMessageReaded(false);
	        newMessage.setCreatedAt(LocalDateTime.now());

	        // Guardar mensaje
	        messageRepository.save(newMessage);

	        return ResponseEntity.status(HttpStatus.CREATED).body(newMessage);
	    } catch (JSONException e) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error en el cuerpo de la solicitud: " + e.getMessage());
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno: " + e.getMessage());
	    }
	}


	@PutMapping("/api/notifications/read")
	public ResponseEntity<?> markConversationAsRead(@RequestBody String updatedInfo) {
	    try {
	        JSONObject data = new JSONObject(updatedInfo);

	        String idUserSender = data.getString("idUserSender");
	        String idUserRecipient = data.getString("idUserRecipient");
	        String token = data.getString("token");

	        // Validar el token
	        Token t = tokenRepository.findToken(token);
	        if (t == null || t.isExpired()) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido o expirado.");
	        }

	        // Buscar los mensajes entre ambos usuarios
	        List<Message> conversationMessages = messageRepository.findByUsers(
	        	    idUserSender, 
	        	    idUserRecipient, 
	        	    Sort.by(Sort.Order.asc("createdAt")) 
	        	);

	        if (conversationMessages.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No hay mensajes entre estos usuarios.");
	        }

	        // Marcar como leídos todos los mensajes del remitente hacia el destinatario
	        conversationMessages.forEach(message -> {
	            if (!message.isMessageReaded()) { // Solo si no está leído
	                message.setMessageReaded(true);
	            }
	        });

	        // Guardar todos los mensajes actualizados
	        messageRepository.saveAll(conversationMessages);

	        return ResponseEntity.ok("Mensajes marcados como leídos.");

	    } catch (JSONException e) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error en el formato JSON: " + e.getMessage());
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar los mensajes: " + e.getMessage());
	    }
	}
	
	@GetMapping("/api/messages/conversation")
	public ResponseEntity<List<Message>> getConversation(
	        @RequestParam String idUserSender,
	        @RequestParam String idUserRecipient,
	        @RequestParam String token) {

	    // Validar token
	    Token t = tokenRepository.findToken(token);
	    if (t == null || t.isExpired()) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
	    }

	    List<Message> conversationMessages = messageRepository.findByUsers(
	            idUserSender,
	            idUserRecipient,
	            Sort.by(Sort.Order.asc("createdAt"))
	    );

	    if (conversationMessages.isEmpty()) {
	        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	    }

	    return ResponseEntity.ok(conversationMessages);
	}

	@PutMapping("/api/exchanges/")
	public ResponseEntity<?> updateExchange(@RequestParam String id, @RequestBody String exchangeJson) {

		try {
			JSONObject objectExchange = new JSONObject(exchangeJson);

			String token = objectExchange.getString("token");
			Token t = tokenRepository.findToken(token);

			if (t == null || t.isExpired()) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido o expirado.");
			}

			Optional<Exchange> optionalExchange = exchangeRepository.findById(id);
			if (optionalExchange.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Exchange no encontrado.");
			}

			Exchange existingExchange = optionalExchange.get();

			// Actualizar solo los campos proporcionados en la petición
			if (objectExchange.has("nativeLanguage")) {
				existingExchange.setNativeLanguage(objectExchange.getString("nativeLanguage"));
			}
			if (objectExchange.has("targetLanguage")) {
				existingExchange.setTargetLanguage(objectExchange.getString("targetLanguage"));
			}
			if (objectExchange.has("educationalLevel")) {
				existingExchange.setEducationalLevel(objectExchange.getString("educationalLevel"));
			}
			if (objectExchange.has("academicLevel")) {
				existingExchange.setAcademicLevel(objectExchange.getString("academicLevel"));
			}
			if (objectExchange.has("beginDate")) {
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
				LocalDate beginDate = LocalDate.parse(objectExchange.getString("beginDate"), formatter);
				existingExchange.setBeginDate(Date.from(beginDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));
			}
			if (objectExchange.has("endDate")) {
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
				LocalDate endDate = LocalDate.parse(objectExchange.getString("endDate"), formatter);
				existingExchange.setEndDate(Date.from(endDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));
			}
			if (objectExchange.has("quantityStudents")) {
				existingExchange.setQuantityStudents(objectExchange.getInt("quantityStudents"));
			}
			if (objectExchange.has("university")) {
				existingExchange.setUniversity(objectExchange.getString("university"));
			}
			if(objectExchange.has("status")) {
				existingExchange.setUniversity(objectExchange.getString("status"));
			}

			// Guardar cambios en MongoDB
			exchangeRepository.save(existingExchange);

			return ResponseEntity.ok(existingExchange);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("Error al actualizar el intercambio: " + e.getMessage());
		}
	}

	@DeleteMapping("/api/exchanges/")
	public ResponseEntity<?> deleteExchange(@RequestParam String id, @RequestParam("token") String token) {
		try {
			// Verificar que el token es válido
			Token t = tokenRepository.findToken(token);
			if (t != null && !t.isExpired()) {
				// Buscar el exchange por su id
				Optional<Exchange> exchangeOptional = exchangeRepository.findById(id);
				if (exchangeOptional.isPresent()) {
					Exchange exchange = exchangeOptional.get();

					// Eliminar el exchange
					exchangeRepository.delete(exchange);

					// Responder con confirmación de eliminación
					return ResponseEntity.status(HttpStatus.OK).body("Exchange successfully deleted");
				} else {
					// Si no se encuentra el exchange con ese id
					return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Exchange not found");
				}
			} else {
				// Si el token no es válido o ha expirado
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
			}
		} catch (Exception e) {
			// Manejo de errores
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
		}
	}

	@PostMapping("/api/groups")
	public ResponseEntity<String> createGroup(@RequestBody String group) {

		try {
			JSONObject objectGroup = new JSONObject(group);

			String token = objectGroup.getString("token");
			Token t = tokenRepository.findToken(token);
			if (t != null && !t.isExpired()) {
				// Obtener los datos de la solicitud
				String name = objectGroup.getString("name");
				int languajeLevel = objectGroup.getInt("languajeLevel");
				int quantity = objectGroup.getInt("quantity");
				String languaje = objectGroup.getString("languaje");

				// Crear el objeto Group
				Group newGroup = new Group(name, languajeLevel, quantity, languaje, t.getUserId());

				// Guardar el objeto en el repositorio
				groupRepository.save(newGroup);

				// Responder con estado creado
				return ResponseEntity.status(HttpStatus.CREATED).body("Group successfully created");
			} else {
				// Si el token es inválido o ha expirado
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
			}

		} catch (Exception e) {
			// Manejo de excepciones
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("Error al procesar la solicitud: " + e.getMessage());
		}
	}

	@RequestMapping("/api/groups")
	public ResponseEntity<?> getGroupsWithIdOfTeacher(@RequestParam String token) {
		// Buscar el token en la base de datos
		Token t = tokenRepository.findToken(token);

		// Verificar si el token es válido y no ha expirado
		if (t != null && !t.isExpired()) {
			// Obtener los grupos asociados al ID del profesor
			Optional<Group> groupOptional = groupRepository.getGroupByTeacherId(t.getUserId());

			// Si el grupo existe, retornamos el grupo encontrado
			if (groupOptional.isPresent()) {
				return ResponseEntity.status(HttpStatus.OK).body(groupOptional.get());
			} else {
				// Si no se encuentra el grupo, retornamos un mensaje de error
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found for teacher.");
			}
		} else {
			// Si el token es inválido o ha expirado, retornamos un error
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
		}
	}

	@RequestMapping("/api/groups/")
	public ResponseEntity<?> getOneGroup(@RequestParam(required = true) String groupId, @RequestParam String token) {

		Token t = tokenRepository.findToken(token);
		if (t != null && !t.isExpired()) {
			return ResponseEntity.ok().body(groupRepository.findById(groupId));
		} else {
			return ResponseEntity.badRequest().build();
		}
	}

	@PutMapping("/api/groups/")
	public ResponseEntity<?> updateGroup(@RequestParam String id, @RequestBody String groupJson) {
		try {
			JSONObject objectGroup = new JSONObject(groupJson);

			Optional<Group> optionalGroup = groupRepository.findById(id);
			if (optionalGroup.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Grupo no encontrado.");
			}

			Group existingGroup = optionalGroup.get();

			// Actualizar solo los campos proporcionados en la petición
			if (objectGroup.has("name")) {
				existingGroup.setName(objectGroup.getString("name"));
			}
			if (objectGroup.has("languajeLevel")) {
				existingGroup.setLanguajeLevel(objectGroup.getInt("languajeLevel"));
			}
			if (objectGroup.has("quantity")) {
				existingGroup.setQuantity(objectGroup.getInt("quantity"));
			}
			if (objectGroup.has("languaje")) {
				existingGroup.setLanguaje(objectGroup.getString("languaje"));
			}
			if (objectGroup.has("userId")) {
				existingGroup.setUserId(objectGroup.getString("userId"));
			}

			// Guardar cambios en MongoDB
			groupRepository.save(existingGroup);

			return ResponseEntity.ok(existingGroup);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("Error al actualizar el grupo: " + e.getMessage());
		}
	}

	@DeleteMapping("/api/groups/")
	public ResponseEntity<?> deleteGroup(@RequestParam String id, @RequestParam("token") String token) {
		try {
			// Verificar que el token es válido
			Token t = tokenRepository.findToken(token);
			if (t == null || t.isExpired()) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
			}

			// Buscar el grupo por su id
			Optional<Group> groupOptional = groupRepository.findById(id);
			if (groupOptional.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found");
			}

			if (groupOptional.get().getUserId().equals(t.getUserId())) {
				// Eliminar el grupo
				groupRepository.delete(groupOptional.get());
				// Responder con confirmación de eliminación
				return ResponseEntity.status(HttpStatus.OK).body("Group successfully deleted");
			} else {

				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Probably problem with token");
			}

		} catch (Exception e) {
			// Manejo de errores
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
		}
	}

	@PostMapping("/api/upload")
	public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
		try {
			// Llamar al servicio de Cloudinary para cargar el archivo
			String fileUrl = cloudinaryService.uploadFile(file);
			return ResponseEntity.ok(fileUrl); // Retornar la URL del archivo cargado
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body("Error uploading file");
		}
	}

	@PostMapping("/api/preferences")
	public ResponseEntity<String> createPreference(@RequestBody String preferenceJson) {
		try {
			JSONObject objectPref = new JSONObject(preferenceJson);

			String token = objectPref.getString("token");
			Token t = tokenRepository.findToken(token);

			if (t != null && !t.isExpired()) {
				// Obtener los datos de la solicitud
				String userId = t.getUserId();
				boolean darkMode = objectPref.getBoolean("darkMode");
				boolean notifications = objectPref.getBoolean("notifications");
				String language = objectPref.getString("language");

				// Crear el objeto Preferences
				Preferences newPreference = new Preferences(userId, darkMode, notifications, language);

				// Guardar en el repositorio
				preferencesRepository.save(newPreference);

				// Responder con estado 201 Created
				return ResponseEntity.status(HttpStatus.CREATED).body("Preference successfully created");
			} else {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
			}

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("Error al procesar la solicitud: " + e.getMessage());
		}
	}

	// GET - Obtener preferencias del usuario
	@GetMapping("/api/users/me/preferences")
	public ResponseEntity<?> getUserPreferences(@RequestParam String token) {
		try {
			Token t = tokenRepository.findToken(token);

			if (t != null && !t.isExpired()) {
				Preferences preferences = preferencesRepository.findByUserId(t.getUserId());

				if (preferences != null) {
					return ResponseEntity.ok(preferences);
				} else {
					return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Preferences not found for user.");
				}
			} else {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
			}
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error retrieving preferences: " + e.getMessage());
		}
	}

	// PUT - Actualizar preferencias del usuario
	@PutMapping("/api/users/me/preferences")
	public ResponseEntity<String> updateUserPreferences(@RequestBody String preferencesJson) {
		try {
			JSONObject json = new JSONObject(preferencesJson);
			String token = json.getString("token");

			Token t = tokenRepository.findToken(token);
			if (t != null && !t.isExpired()) {
				Preferences preferences = preferencesRepository.findByUserId(t.getUserId());

				if (preferences != null) {
					// Actualizar preferencias con los nuevos valores
					preferences.setDarkMode(json.getBoolean("darkMode"));
					preferences.setNotifications(json.getBoolean("notifications"));
					preferences.setLanguage(json.getString("language"));

					preferencesRepository.save(preferences);
					return ResponseEntity.ok("Preferences updated successfully");
				} else {
					return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Preferences not found for user.");
				}
			} else {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
			}
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating preferences: " + e.getMessage());
		}
	}

	@PutMapping("/api/auth/update")
	public ResponseEntity<String> updateUser(@RequestBody String userData) {
	    try {
	        JSONObject updatedUserObject = new JSONObject(userData);

	        // Extraer y validar el token
	        String token = updatedUserObject.getString("token");
	        Token t = tokenRepository.findToken(token);

	        if (t == null || t.isExpired()) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido o expirado.");
	        }

	        // Obtener el usuario a partir del email asociado al token
	        String email = t.getUserId();
	        User existingUser = userRepository.findUserMail(email);

	        if (existingUser == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado.");
	        }

	        // Actualizar solo los campos proporcionados
	        String name = updatedUserObject.optString("name", existingUser.getName());
	        String university = updatedUserObject.optString("university", existingUser.getUniversity());
	        String urlProfilePicture = updatedUserObject.optString("urlProfilePicture", existingUser.getUrlProfilePicture());
	        String urlHeaderPicture = updatedUserObject.optString("urlHeaderPicture",existingUser.getUrlHeaderPicture());
	        existingUser.setName(name);
	        existingUser.setUniversity(university);
	        existingUser.setUrlProfilePicture(urlProfilePicture);
	        existingUser.setUrlHeaderPicture(urlHeaderPicture);

	        // Guardar cambios en la base de datos
	        userRepository.save(existingUser);

	        return ResponseEntity.ok("Usuario actualizado correctamente");
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                .body("Error al actualizar el usuario: " + e.getMessage());
	    }
	}

	@GetMapping("/api/users/image")
public ResponseEntity<String> getUserImage(@RequestParam String email) {
    User user = userRepository.findUserMail(email);
    
    if (user == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
    }
    
    // Crear un objeto JSON con la URL de la imagen de perfil
    JSONObject responseJson = new JSONObject();
    responseJson.put("urlProfilePicture", user.getUrlProfilePicture());
    
    return ResponseEntity.ok(responseJson.toString());
}

	
}
