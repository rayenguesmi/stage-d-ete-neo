package com.neo.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.neo.app.documents.DocumentEntity;

public interface DocumentRepository extends MongoRepository<DocumentEntity, String> {
}
