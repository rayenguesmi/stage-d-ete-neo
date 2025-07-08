package com.neo.app.repository;

import com.neo.app.documents.AuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLogEntity, String> {

    List<AuditLogEntity> findByUserId(String userId);

    List<AuditLogEntity> findByUsername(String username);

    List<AuditLogEntity> findByAction(String action);

    List<AuditLogEntity> findByResourceType(String resourceType);

    List<AuditLogEntity> findByResourceId(String resourceId);

    List<AuditLogEntity> findByProjectId(String projectId);

    List<AuditLogEntity> findBySuccess(Boolean success);

    @Query("{'timestamp': {'$gte': ?0, '$lte': ?1}}")
    List<AuditLogEntity> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'userId': ?0, 'timestamp': {'$gte': ?1, '$lte': ?2}}")
    List<AuditLogEntity> findByUserIdAndTimestampBetween(String userId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'action': ?0, 'timestamp': {'$gte': ?1, '$lte': ?2}}")
    List<AuditLogEntity> findByActionAndTimestampBetween(String action, LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'resourceType': ?0, 'resourceId': ?1}")
    List<AuditLogEntity> findByResourceTypeAndResourceId(String resourceType, String resourceId);

    @Query("{'projectId': ?0, 'timestamp': {'$gte': ?1, '$lte': ?2}}")
    List<AuditLogEntity> findByProjectIdAndTimestampBetween(String projectId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'success': false, 'timestamp': {'$gte': ?0, '$lte': ?1}}")
    List<AuditLogEntity> findFailedActionsBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'action': {'$in': ['LOGIN', 'LOGOUT']}, 'userId': ?0}")
    List<AuditLogEntity> findLoginLogsByUserId(String userId);

    @Query("{'ipAddress': ?0, 'timestamp': {'$gte': ?1, '$lte': ?2}}")
    List<AuditLogEntity> findByIpAddressAndTimestampBetween(String ipAddress, LocalDateTime startDate, LocalDateTime endDate);

    // Méthodes avec pagination
    Page<AuditLogEntity> findByUserId(String userId, Pageable pageable);

    Page<AuditLogEntity> findByProjectId(String projectId, Pageable pageable);

    @Query("{'timestamp': {'$gte': ?0, '$lte': ?1}}")
    Page<AuditLogEntity> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Méthodes de comptage
    @Query(value = "{'userId': ?0}", count = true)
    long countByUserId(String userId);

    @Query(value = "{'action': ?0, 'timestamp': {'$gte': ?1, '$lte': ?2}}", count = true)
    long countByActionAndTimestampBetween(String action, LocalDateTime startDate, LocalDateTime endDate);

    @Query(value = "{'success': false, 'timestamp': {'$gte': ?0, '$lte': ?1}}", count = true)
    long countFailedActionsBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query(value = "{'projectId': ?0, 'timestamp': {'$gte': ?1, '$lte': ?2}}", count = true)
    long countByProjectIdAndTimestampBetween(String projectId, LocalDateTime startDate, LocalDateTime endDate);
}

