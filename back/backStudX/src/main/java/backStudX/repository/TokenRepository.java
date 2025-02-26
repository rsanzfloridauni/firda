package backStudX.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import backStudX.model.Token;

@Repository
public interface TokenRepository extends MongoRepository<Token, String> {

	@Query(value = "{'userId' : ?0")
	List<Token> findUserTokens(String emailUser);
	
	@Query(value = "{token : ?0}")
	Token findToken(String token);
	
	
}
