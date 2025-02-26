package backStudX.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import backStudX.model.Exchange;
import backStudX.model.Group;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
	
	@Query(value="{'userId' : ?0}")
	Optional<Group> getGroupByTeacherId(String userId);

	
}
