package backStudX.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import backStudX.model.Exchange;

@Repository
public interface ExchangeRepository extends MongoRepository<Exchange, String> {
	
    Optional<Exchange> findById(String id);

	
}
