package backStudX.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import backStudX.model.Preferences;
import backStudX.model.User;

public interface PreferencesRepository extends MongoRepository<Preferences, String> {

	@Query(value = "{ 'preferences' : ?0 }")
	List<User> findUserPreferences(boolean darkMode);
	
    Preferences findByUserId(String userId);

}
