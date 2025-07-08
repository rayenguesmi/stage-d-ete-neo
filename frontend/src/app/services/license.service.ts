import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { License, LicenseCreateRequest, LicenseUpdateRequest, LicenseStats } from '../models/license.model';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private apiUrl = '/api/licenses';

  constructor(private http: HttpClient) { }

  // Création d'une licence
  createLicense(license: LicenseCreateRequest): Observable<License> {
    return this.http.post<License>(this.apiUrl, license);
  }

  // Mise à jour d'une licence
  updateLicense(licenseId: string, license: LicenseUpdateRequest): Observable<License> {
    return this.http.put<License>(`${this.apiUrl}/${licenseId}`, license);
  }

  // Suppression d'une licence
  deleteLicense(licenseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${licenseId}`);
  }

  // Récupération d'une licence par ID
  getLicenseById(licenseId: string): Observable<License> {
    return this.http.get<License>(`${this.apiUrl}/${licenseId}`);
  }

  // Récupération de toutes les licences
  getAllLicenses(): Observable<License[]> {
    return this.http.get<License[]>(this.apiUrl);
  }

  // Récupération des licences actives
  getActiveLicenses(): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}/active`);
  }

  // Récupération des licences par statut
  getLicensesByStatus(status: string): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}/status/${status}`);
  }

  // Récupération des licences par type
  getLicensesByType(type: string): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}/type/${type}`);
  }

  // Recherche de licences par nom de client
  searchLicenses(clientName: string): Observable<License[]> {
    const params = new HttpParams().set('clientName', clientName);
    return this.http.get<License[]>(`${this.apiUrl}/search`, { params });
  }

  // Récupération des licences expirées
  getExpiredLicenses(): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}/expired`);
  }

  // Récupération des licences qui expirent bientôt
  getLicensesExpiringSoon(days: number = 30): Observable<License[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<License[]>(`${this.apiUrl}/expiring-soon`, { params });
  }

  // Validation d'une licence
  validateLicense(licenseKey: string): Observable<{valid: boolean, message: string}> {
    return this.http.get<{valid: boolean, message: string}>(`${this.apiUrl}/validate/${licenseKey}`);
  }

  // Changement de statut d'une licence
  changeLicenseStatus(licenseId: string, status: string): Observable<License> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<License>(`${this.apiUrl}/${licenseId}/status`, {}, { params });
  }

  // Mise à jour du nombre d'utilisateurs actuels
  updateCurrentUsers(licenseId: string, currentUsers: number): Observable<License> {
    const params = new HttpParams().set('currentUsers', currentUsers.toString());
    return this.http.patch<License>(`${this.apiUrl}/${licenseId}/users`, {}, { params });
  }

  // Renouvellement d'une licence
  renewLicense(licenseId: string, newEndDate: string): Observable<License> {
    const params = new HttpParams().set('newEndDate', newEndDate);
    return this.http.patch<License>(`${this.apiUrl}/${licenseId}/renew`, {}, { params });
  }

  // Vérification des licences et envoi d'alertes
  checkLicensesAndSendAlerts(): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-alerts`, {});
  }

  // Récupération des licences proches de la limite d'utilisateurs
  getLicensesNearUserLimit(): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}/near-user-limit`);
  }

  // Statistiques des licences
  getLicenseStats(): Observable<LicenseStats> {
    return this.http.get<LicenseStats>(`${this.apiUrl}/stats`);
  }

  // Méthodes utilitaires
  isLicenseExpired(license: License): boolean {
    return new Date(license.endDate) < new Date();
  }

  isLicenseExpiringSoon(license: License, days: number = 30): boolean {
    const expiryDate = new Date(license.endDate);
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + days);
    return expiryDate <= alertDate && expiryDate > new Date();
  }

  getDaysUntilExpiry(license: License): number {
    const expiryDate = new Date(license.endDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getUserUsagePercentage(license: License): number {
    return (license.currentUsers / license.maxUsers) * 100;
  }
}

