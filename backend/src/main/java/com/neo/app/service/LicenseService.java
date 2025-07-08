package com.neo.app.service;

import com.neo.app.documents.LicenseEntity;
import com.neo.app.repository.LicenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LicenseService {

    @Autowired
    private LicenseRepository licenseRepository;

    @Autowired
    private AuditLogService auditLogService;

    // Création d'une licence
    public LicenseEntity createLicense(LicenseEntity license) {
        // Générer une clé de licence unique si elle n'est pas fournie
        if (license.getLicenseKey() == null || license.getLicenseKey().isEmpty()) {
            license.setLicenseKey(generateLicenseKey());
        }

        // Vérifier que la clé est unique
        if (licenseRepository.existsByLicenseKey(license.getLicenseKey())) {
            throw new RuntimeException("Une licence avec cette clé existe déjà");
        }

        license.setCreatedAt(LocalDateTime.now());
        license.setUpdatedAt(LocalDateTime.now());
        license.setStatus("ACTIVE");
        license.setCurrentUsers(0);
        license.setAlertSent(false);

        return licenseRepository.save(license);
    }

    // Mise à jour d'une licence
    public LicenseEntity updateLicense(String licenseId, LicenseEntity updatedLicense) {
        Optional<LicenseEntity> existingLicense = licenseRepository.findById(licenseId);
        
        if (existingLicense.isEmpty()) {
            throw new RuntimeException("Licence non trouvée");
        }

        LicenseEntity license = existingLicense.get();
        
        // Vérifier l'unicité de la clé si elle a changé
        if (!license.getLicenseKey().equals(updatedLicense.getLicenseKey()) && 
            licenseRepository.existsByLicenseKey(updatedLicense.getLicenseKey())) {
            throw new RuntimeException("Une licence avec cette clé existe déjà");
        }

        // Mettre à jour les champs
        license.setLicenseKey(updatedLicense.getLicenseKey());
        license.setClientName(updatedLicense.getClientName());
        license.setLicenseType(updatedLicense.getLicenseType());
        license.setMaxUsers(updatedLicense.getMaxUsers());
        license.setFeatures(updatedLicense.getFeatures());
        license.setStartDate(updatedLicense.getStartDate());
        license.setEndDate(updatedLicense.getEndDate());
        license.setDaysBeforeExpiryAlert(updatedLicense.getDaysBeforeExpiryAlert());
        license.setUpdatedAt(LocalDateTime.now());

        return licenseRepository.save(license);
    }

    // Suppression d'une licence
    public void deleteLicense(String licenseId) {
        if (!licenseRepository.existsById(licenseId)) {
            throw new RuntimeException("Licence non trouvée");
        }
        
        // Vérifier s'il y a des projets associés
        // TODO: Ajouter la vérification des dépendances
        
        licenseRepository.deleteById(licenseId);
    }

    // Récupération d'une licence par ID
    public Optional<LicenseEntity> getLicenseById(String licenseId) {
        return licenseRepository.findById(licenseId);
    }

    // Récupération d'une licence par clé
    public Optional<LicenseEntity> getLicenseByKey(String licenseKey) {
        return licenseRepository.findByLicenseKey(licenseKey);
    }

    // Récupération de toutes les licences
    public List<LicenseEntity> getAllLicenses() {
        return licenseRepository.findAll();
    }

    // Récupération des licences actives
    public List<LicenseEntity> getActiveLicenses() {
        return licenseRepository.findByStatusOrderByEndDateAsc("ACTIVE");
    }

    // Récupération des licences par statut
    public List<LicenseEntity> getLicensesByStatus(String status) {
        return licenseRepository.findByStatus(status);
    }

    // Récupération des licences par type
    public List<LicenseEntity> getLicensesByType(String licenseType) {
        return licenseRepository.findByLicenseType(licenseType);
    }

    // Recherche de licences par nom de client
    public List<LicenseEntity> searchLicensesByClient(String clientName) {
        return licenseRepository.findByClientNameContainingIgnoreCase(clientName);
    }

    // Récupération des licences expirées
    public List<LicenseEntity> getExpiredLicenses() {
        return licenseRepository.findExpiredLicenses(LocalDateTime.now());
    }

    // Récupération des licences qui expirent bientôt
    public List<LicenseEntity> getLicensesExpiringSoon(int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime futureDate = now.plusDays(days);
        return licenseRepository.findLicensesExpiringSoon(now, futureDate);
    }

    // Récupération des licences nécessitant une alerte
    public List<LicenseEntity> getLicensesNeedingAlert() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime futureDate = now.plusDays(30); // Par défaut 30 jours
        return licenseRepository.findLicensesNeedingAlert(now, futureDate);
    }

    // Validation d'une licence
    public boolean validateLicense(String licenseKey) {
        Optional<LicenseEntity> license = licenseRepository.findByLicenseKey(licenseKey);
        
        if (license.isEmpty()) {
            return false;
        }

        LicenseEntity licenseEntity = license.get();
        
        // Vérifier le statut
        if (!"ACTIVE".equals(licenseEntity.getStatus())) {
            return false;
        }

        // Vérifier l'expiration
        if (licenseEntity.isExpired()) {
            // Marquer comme expirée
            licenseEntity.setStatus("EXPIRED");
            licenseRepository.save(licenseEntity);
            return false;
        }

        // Mettre à jour la dernière vérification
        licenseEntity.setLastCheck(LocalDateTime.now());
        licenseRepository.save(licenseEntity);

        return true;
    }

    // Changement de statut d'une licence
    public LicenseEntity changeLicenseStatus(String licenseId, String newStatus) {
        Optional<LicenseEntity> licenseOpt = licenseRepository.findById(licenseId);
        
        if (licenseOpt.isEmpty()) {
            throw new RuntimeException("Licence non trouvée");
        }

        LicenseEntity license = licenseOpt.get();
        String oldStatus = license.getStatus();
        license.setStatus(newStatus);
        license.setUpdatedAt(LocalDateTime.now());
        
        LicenseEntity updatedLicense = licenseRepository.save(license);
        
        // Log de l'audit
        auditLogService.logAction(
            null, // TODO: récupérer l'utilisateur actuel
            null,
            "STATUS_CHANGE",
            "LICENSE",
            licenseId,
            "License status changed from " + oldStatus + " to " + newStatus,
            null,
            null,
            null
        );
        
        return updatedLicense;
    }

    // Mise à jour du nombre d'utilisateurs actuels
    public LicenseEntity updateCurrentUsers(String licenseId, int currentUsers) {
        Optional<LicenseEntity> licenseOpt = licenseRepository.findById(licenseId);
        
        if (licenseOpt.isEmpty()) {
            throw new RuntimeException("Licence non trouvée");
        }

        LicenseEntity license = licenseOpt.get();
        
        if (currentUsers > license.getMaxUsers()) {
            throw new RuntimeException("Le nombre d'utilisateurs dépasse la limite de la licence");
        }
        
        license.setCurrentUsers(currentUsers);
        license.setUpdatedAt(LocalDateTime.now());
        
        return licenseRepository.save(license);
    }

    // Vérification des licences et envoi d'alertes
    public void checkLicensesAndSendAlerts() {
        List<LicenseEntity> licensesNeedingAlert = getLicensesNeedingAlert();
        
        for (LicenseEntity license : licensesNeedingAlert) {
            if (!license.getAlertSent()) {
                // Envoyer l'alerte (email, notification, etc.)
                sendExpiryAlert(license);
                
                // Marquer l'alerte comme envoyée
                license.setAlertSent(true);
                licenseRepository.save(license);
            }
        }
    }

    // Récupération des licences proches de la limite d'utilisateurs
    public List<LicenseEntity> getLicensesNearUserLimit() {
        return licenseRepository.findLicensesNearUserLimit();
    }

    // Statistiques des licences
    public long countLicensesByStatus(String status) {
        return licenseRepository.countByStatus(status);
    }

    public long countLicensesByType(String licenseType) {
        return licenseRepository.countByLicenseType(licenseType);
    }

    // Génération d'une clé de licence unique
    private String generateLicenseKey() {
        return "NEO-TM-" + UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 16);
    }

    // Envoi d'alerte d'expiration (à implémenter selon les besoins)
    private void sendExpiryAlert(LicenseEntity license) {
        // TODO: Implémenter l'envoi d'email ou de notification
        System.out.println("Alerte: La licence " + license.getLicenseKey() + 
                          " expire le " + license.getEndDate() + 
                          " (dans " + license.getDaysUntilExpiry() + " jours)");
    }

    // Renouvellement d'une licence
    public LicenseEntity renewLicense(String licenseId, LocalDateTime newEndDate) {
        Optional<LicenseEntity> licenseOpt = licenseRepository.findById(licenseId);
        
        if (licenseOpt.isEmpty()) {
            throw new RuntimeException("Licence non trouvée");
        }

        LicenseEntity license = licenseOpt.get();
        license.setEndDate(newEndDate);
        license.setStatus("ACTIVE");
        license.setAlertSent(false);
        license.setUpdatedAt(LocalDateTime.now());
        
        return licenseRepository.save(license);
    }
}

