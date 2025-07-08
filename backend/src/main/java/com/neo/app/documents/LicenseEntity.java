package com.neo.app.documents;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "licenses")
public class LicenseEntity {

    @Id
    private String id;

    @Field("license_key")
    private String licenseKey;

    @Field("client_name")
    private String clientName;

    @Field("project_id")
    private String projectId;

    @Field("license_type")
    private String licenseType; // STANDARD, PREMIUM, ENTERPRISE

    @Field("status")
    private String status; // ACTIVE, EXPIRED, SUSPENDED, REVOKED

    @Field("max_users")
    private Integer maxUsers;

    @Field("current_users")
    private Integer currentUsers;

    @Field("features")
    private String features; // JSON string des fonctionnalités autorisées

    @Field("start_date")
    private LocalDateTime startDate;

    @Field("end_date")
    private LocalDateTime endDate;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    @Field("created_by")
    private String createdBy;

    @Field("last_check")
    private LocalDateTime lastCheck;

    @Field("alert_sent")
    private Boolean alertSent; // Pour les alertes d'expiration

    @Field("days_before_expiry_alert")
    private Integer daysBeforeExpiryAlert; // Nombre de jours avant expiration pour envoyer l'alerte

    // Constructeurs
    public LicenseEntity() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "ACTIVE";
        this.currentUsers = 0;
        this.alertSent = false;
        this.daysBeforeExpiryAlert = 30; // Par défaut 30 jours
    }

    public LicenseEntity(String licenseKey, String clientName, String licenseType, Integer maxUsers) {
        this();
        this.licenseKey = licenseKey;
        this.clientName = clientName;
        this.licenseType = licenseType;
        this.maxUsers = maxUsers;
    }

    // Méthodes utilitaires
    public boolean isExpired() {
        return endDate != null && LocalDateTime.now().isAfter(endDate);
    }

    public boolean isExpiringSoon() {
        if (endDate == null) return false;
        LocalDateTime alertDate = endDate.minusDays(daysBeforeExpiryAlert);
        return LocalDateTime.now().isAfter(alertDate) && LocalDateTime.now().isBefore(endDate);
    }

    public long getDaysUntilExpiry() {
        if (endDate == null) return -1;
        return java.time.Duration.between(LocalDateTime.now(), endDate).toDays();
    }

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLicenseKey() {
        return licenseKey;
    }

    public void setLicenseKey(String licenseKey) {
        this.licenseKey = licenseKey;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getLicenseType() {
        return licenseType;
    }

    public void setLicenseType(String licenseType) {
        this.licenseType = licenseType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getMaxUsers() {
        return maxUsers;
    }

    public void setMaxUsers(Integer maxUsers) {
        this.maxUsers = maxUsers;
    }

    public Integer getCurrentUsers() {
        return currentUsers;
    }

    public void setCurrentUsers(Integer currentUsers) {
        this.currentUsers = currentUsers;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getLastCheck() {
        return lastCheck;
    }

    public void setLastCheck(LocalDateTime lastCheck) {
        this.lastCheck = lastCheck;
    }

    public Boolean getAlertSent() {
        return alertSent;
    }

    public void setAlertSent(Boolean alertSent) {
        this.alertSent = alertSent;
    }

    public Integer getDaysBeforeExpiryAlert() {
        return daysBeforeExpiryAlert;
    }

    public void setDaysBeforeExpiryAlert(Integer daysBeforeExpiryAlert) {
        this.daysBeforeExpiryAlert = daysBeforeExpiryAlert;
    }
}

