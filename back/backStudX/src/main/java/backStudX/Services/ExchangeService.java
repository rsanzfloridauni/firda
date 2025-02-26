package backStudX.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import backStudX.model.Exchange;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.Date;
import java.util.List;

@Service
public class ExchangeService {

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Exchange> searchExchanges(String nativeLanguage, String targetLanguage, String educationalLevel,
                                          String academicLevel, Date beginDate, Date endDate,
                                          Integer quantityStudentsMin, Integer quantityStudentsMax, String university, String userId) {
        Query query = new Query();

        if (nativeLanguage != null) {
            query.addCriteria(Criteria.where("nativeLanguage").is(nativeLanguage));
        }
        if (targetLanguage != null) {
            query.addCriteria(Criteria.where("targetLanguage").is(targetLanguage));
        }
        if (educationalLevel != null) {
            query.addCriteria(Criteria.where("educationalLevel").is(educationalLevel));
        }
        if (academicLevel != null) {
            query.addCriteria(Criteria.where("academicLevel").is(academicLevel));
        }
        if (beginDate != null) {
            query.addCriteria(Criteria.where("beginDate").gte(beginDate));
        }
        if (endDate != null) {
            query.addCriteria(Criteria.where("endDate").lte(endDate));
        }
        if (quantityStudentsMin != null) {
            query.addCriteria(Criteria.where("quantityStudents").gte(quantityStudentsMin));
        }
        if (quantityStudentsMax != null) {
            query.addCriteria(Criteria.where("quantityStudents").lte(quantityStudentsMax));
        }
        if (university != null) {
            query.addCriteria(Criteria.where("university").is(university));
        }

        if (userId != null) {
            query.addCriteria(Criteria.where("idTeacherCreator").is(userId));
        }
        return mongoTemplate.find(query, Exchange.class);
    }
}
