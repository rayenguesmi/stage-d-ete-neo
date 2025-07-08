package com.neo.app.repository;

import com.neo.app.documents.LicenseEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseRepository extends MongoRepository<LicenseEntity, String> {

    // Recherche par clé de licence
    Optional<LicenseEntity> findByLicenseKey(String licenseKey);

    // Recherche par nom de client
    List<LicenseEntity> findByClientNameContainingIgnoreCase(String clientName);

    // Recherche par type de licence
    List<LicenseEntity> findByLicenseType(String licenseType);

    // Recherche par statut
    List<LicenseEntity> findByStatus(String status);

    // Recherche par projet
    Optional<LicenseEntity> findByProjectId(String projectId);

    // Recherche des licences actives
    List<LicenseEntity> findByStatusOrderByEndDateAsc(String status);

    // Recherche des licences expirées
    @Query("{ 'endDate': { $lt: ?0 } }")
    List<LicenseEntity> findExpiredLicenses(LocalDateTime currentDate);

    // Recherche des licences qui expirent bientôt
    @Query("{ 'endDate': { $gte: ?0, $lte: ?1 }, 'status': 'ACTIVE' }")
    List<LicenseEntity> findLicensesExpiringSoon(LocalDateTime startDate, LocalDateTime endDate);

    // Recherche des licences qui expirent dans X jours
    @Query("{ 'endDate': { $gte: ?0, $lte: ?1 }, 'status': 'ACTIVE', 'alertSent': false }")
    List<LicenseEntity> findLicensesNeedingAlert(LocalDateTime startDate, LocalDateTime endDate);

    // Vérifier si une clé de licence existe déjà
    boolean existsByLicenseKey(String licenseKey);

    // Compter les licences par statut
    long countByStatus(String status);

    // Compter les licences par type
    long countByLicenseType(String licenseType);

    // Recherche des licences créées par un utilisateur
    List<LicenseEntity> findByCreatedBy(String createdBy);

    // Recherche des licences avec un nombre d'utilisateurs proche de la limite
    @Query("{ 'currentUsers': { $gte: { $multiply: ['$maxUsers', 0.8] } }, 'status': 'ACTIVE' }")
    List<LicenseEntity> findLicensesNearUserLimit();

    // Recherche des licences par plage de dates
    @Query("{ 'startDate': { $gte: ?0 }, 'endDate': { $lte: ?1 } }")
    List<LicenseEntity> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
}

