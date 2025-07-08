package com.neo.app.controller;

import com.neo.app.documents.LicenseEntity;
import com.neo.app.service.LicenseService;
import com.neo.app.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/licenses")
@CrossOrigin(origins = "*")
public class LicenseController {

    @Autowired
    private LicenseService licenseService;

    @Autowired
    private AuditLogService auditLogService;

    // Création d'une licence (Admin général seulement)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN_GENERAL')")
    public ResponseEntity<?> createLicense(@RequestBody LicenseEntity license, HttpServletRequest request) {
        try {
            license.setCreatedBy(getCurrentUserId(request));
            LicenseEntity createdLicense = licenseService.createLicense(license);

            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "CREATE",
                    "LICENSE",
                    createdLicense.getId(),
                    "License created: " + createdLicense.getLicenseKey(),
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(createdLicense);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors de la création de la licence", e.getMessage()));
        }
    }

    // Mise à jour d'une licence
    @PutMapping("/{licenseId}")
    @PreAuthorize("hasRole('ADMIN_GENERAL')")
    public ResponseEntity<?> updateLicense(@PathVariable String licenseId,
                                           @RequestBody LicenseEntity license,
                                           HttpServletRequest request) {
        try {
            LicenseEntity updatedLicense = licenseService.updateLicense(licenseId, license);

            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "UPDATE",
                    "LICENSE",
                    updatedLicense.getId(),
                    "License updated: " + updatedLicense.getLicenseKey(),
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(updatedLicense);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors de la mise à jour de la licence", e.getMessage()));
        }
    }

    // Suppression d'une licence (Admin général seulement)
    @DeleteMapping("/{licenseId}")
    @PreAuthorize("hasRole('ADMIN_GENERAL')")
    public ResponseEntity<?> deleteLicense(@PathVariable String licenseId, HttpServletRequest request) {
        try {
            licenseService.deleteLicense(licenseId);

            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "DELETE",
                    "LICENSE",
                    licenseId,
                    "License deleted",
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(new SuccessResponse("Licence supprimée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors de la suppression de la licence", e.getMessage()));
        }
    }

    // Récupération d'une licence par ID
    @GetMapping("/{licenseId}")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getLicenseById(@PathVariable String licenseId) {
        try {
            Optional<LicenseEntity> license = licenseService.getLicenseById(licenseId);
            if (license.isPresent()) {
                return ResponseEntity.ok(license.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Licence non trouvée", "Aucune licence trouvée avec l'ID: " + licenseId));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération de la licence", e.getMessage()));
        }
    }

    // Récupération de toutes les licences
    @GetMapping
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getAllLicenses() {
        try {
            List<LicenseEntity> licenses = licenseService.getAllLicenses();
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des licences", e.getMessage()));
        }
    }

    // Récupération des licences actives
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getActiveLicenses() {
        try {
            List<LicenseEntity> licenses = licenseService.getActiveLicenses();
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des licences actives", e.getMessage()));
        }
    }

    // Récupération des licences par statut
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getLicensesByStatus(@PathVariable String status) {
        try {
            List<LicenseEntity> licenses = licenseService.getLicensesByStatus(status);
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des licences par statut", e.getMessage()));
        }
    }

    // Récupération des licences par type
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getLicensesByType(@PathVariable String type) {
        try {
            List<LicenseEntity> licenses = licenseService.getLicensesByType(type);
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des licences par type", e.getMessage()));
        }
    }

    // Recherche de licences par nom de client
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> searchLicenses(@RequestParam String clientName) {
        try {
            List<LicenseEntity> licenses = licenseService.searchLicensesByClient(clientName);
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la recherche de licences", e.getMessage()));
        }
    }

    // Récupération des licences expirées
    @GetMapping("/expired")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getExpiredLicenses() {
        try {
            List<LicenseEntity> licenses = licenseService.getExpiredLicenses();
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des licences expirées", e.getMessage()));
        }
    }

    // Récupération des licences qui expirent bientôt
    @GetMapping("/expiring-soon")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getLicensesExpiringSoon(@RequestParam(defaultValue = "30") int days) {
        try {
            List<LicenseEntity> licenses = licenseService.getLicensesExpiringSoon(days);
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des licences expirant bientôt", e.getMessage()));
        }
    }

    // Validation d'une licence
    @GetMapping("/validate/{licenseKey}")
    public ResponseEntity<?> validateLicense(@PathVariable String licenseKey) {
        try {
            boolean isValid = licenseService.validateLicense(licenseKey);
            return ResponseEntity.ok(new ValidationResponse(isValid, isValid ? "Licence valide" : "Licence invalide ou expirée"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la validation de la licence", e.getMessage()));
        }
    }

    // Changement de statut d'une licence
    @PatchMapping("/{licenseId}/status")
    @PreAuthorize("hasRole('ADMIN_GENERAL')")
    public ResponseEntity<?> changeLicenseStatus(@PathVariable String licenseId,
                                                  @RequestParam String status,
                                                  HttpServletRequest request) {
        try {
            LicenseEntity updatedLicense = licenseService.changeLicenseStatus(licenseId, status);

            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "STATUS_CHANGE",
                    "LICENSE",
                    licenseId,
                    "License status changed to: " + status,
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(updatedLicense);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors du changement de statut", e.getMessage()));
        }
    }

    // Mise à jour du nombre d'utilisateurs actuels
    @PatchMapping("/{licenseId}/users")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> updateCurrentUsers(@PathVariable String licenseId,
                                                 @RequestParam int currentUsers,
                                                 HttpServletRequest request) {
        try {
            LicenseEntity updatedLicense = licenseService.updateCurrentUsers(licenseId, currentUsers);

            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "UPDATE_USERS",
                    "LICENSE",
                    licenseId,
                    "License current users updated to: " + currentUsers,
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(updatedLicense);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors de la mise à jour du nombre d'utilisateurs", e.getMessage()));
        }
    }

    // Renouvellement d'une licence
    @PatchMapping("/{licenseId}/renew")
    @PreAuthorize("hasRole('ADMIN_GENERAL')")
    public ResponseEntity<?> renewLicense(@PathVariable String licenseId,
                                          @RequestParam String newEndDate,
                                          HttpServletRequest request) {
        try {
            LocalDateTime endDate = LocalDateTime.parse(newEndDate);
            LicenseEntity renewedLicense = licenseService.renewLicense(licenseId, endDate);

            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "RENEW",
                    "LICENSE",
                    licenseId,
                    "License renewed until: " + newEndDate,
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(renewedLicense);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors du renouvellement de la licence", e.getMessage()));
        }
    }

    // Vérification des licences et envoi d'alertes
    @PostMapping("/check-alerts")
    @PreAuthorize("hasRole('ADMIN_GENERAL')")
    public ResponseEntity<?> checkLicensesAndSendAlerts(HttpServletRequest request) {
        try {
            licenseService.checkLicensesAndSendAlerts();

            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "CHECK_ALERTS",
                    "LICENSE",
                    null,
                    "License alerts check executed",
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(new SuccessResponse("Vérification des alertes effectuée"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la vérification des alertes", e.getMessage()));
        }
    }

    // Récupération des licences proches de la limite d'utilisateurs
    @GetMapping("/near-user-limit")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getLicensesNearUserLimit() {
        try {
            List<LicenseEntity> licenses = licenseService.getLicensesNearUserLimit();
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des licences proches de la limite", e.getMessage()));
        }
    }

    // Statistiques des licences
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getLicenseStats() {
        try {
            LicenseStatsResponse stats = new LicenseStatsResponse();
            stats.setActiveCount(licenseService.countLicensesByStatus("ACTIVE"));
            stats.setExpiredCount(licenseService.countLicensesByStatus("EXPIRED"));
            stats.setSuspendedCount(licenseService.countLicensesByStatus("SUSPENDED"));
            stats.setStandardCount(licenseService.countLicensesByType("STANDARD"));
            stats.setPremiumCount(licenseService.countLicensesByType("PREMIUM"));
            stats.setEnterpriseCount(licenseService.countLicensesByType("ENTERPRISE"));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des statistiques", e.getMessage()));
        }
    }

    // Méthodes utilitaires
    private String getCurrentUserId(HttpServletRequest request) {
        return request.getHeader("X-User-ID");
    }

    private String getCurrentUsername(HttpServletRequest request) {
        return request.getHeader("X-Username");
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    // Classes pour les réponses
    public static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class ValidationResponse {
        private boolean valid;
        private String message;

        public ValidationResponse(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class LicenseStatsResponse {
        private long activeCount;
        private long expiredCount;
        private long suspendedCount;
        private long standardCount;
        private long premiumCount;
        private long enterpriseCount;

        // Getters et Setters
        public long getActiveCount() { return activeCount; }
        public void setActiveCount(long activeCount) { this.activeCount = activeCount; }

        public long getExpiredCount() { return expiredCount; }
        public void setExpiredCount(long expiredCount) { this.expiredCount = expiredCount; }

        public long getSuspendedCount() { return suspendedCount; }
        public void setSuspendedCount(long suspendedCount) { this.suspendedCount = suspendedCount; }

        public long getStandardCount() { return standardCount; }
        public void setStandardCount(long standardCount) { this.standardCount = standardCount; }

        public long getPremiumCount() { return premiumCount; }
        public void setPremiumCount(long premiumCount) { this.premiumCount = premiumCount; }

        public long getEnterpriseCount() { return enterpriseCount; }
        public void setEnterpriseCount(long enterpriseCount) { this.enterpriseCount = enterpriseCount; }
    }
}

