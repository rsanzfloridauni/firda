package backStudX.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import backStudX.model.User;

public interface UserRepository extends MongoRepository<User, String> {

	@Query(value = "{ 'email' : ?0 }")
	User findUserMail(String email);

}
	