package backStudX;

import org.mindrot.jbcrypt.BCrypt;

public class Util {

	// Method for cifrate the password
	public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt(12));
    }

    // Method for verifying if the passwords matches
    public static boolean verifyPassword(String password, String hashedPassword) {
        return BCrypt.checkpw(password, hashedPassword);
    }
	
}
