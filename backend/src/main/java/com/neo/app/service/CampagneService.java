package com.neo.app.service;

import com.neo.app.documents.CampagneEntity;
import com.neo.app.repository.CampagneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CampagneService {

    @Autowired
    private CampagneRepository campagneRepository;

    // Ajouter une nouvelle campagne
    public CampagneEntity createCampaign(CampagneEntity campaign) {
        campaign.setCreatedAt(LocalDate.now());
        campaign.setUpdatedAt(LocalDate.now());
        return campagneRepository.save(campaign);
    }

    // Récupérer toutes les campagnes
    public List<CampagneEntity> getAllCampaigns() {
        return campagneRepository.findAll();
    }
    public List<CampagneEntity> getCampaignsByUserId(String userId) {
        return campagneRepository.findByUserId(userId);
    }
    public Optional<CampagneEntity> updateCampaignByUserId(String userId, String id, CampagneEntity campaign) {
        // Rechercher la campagne par l'id et vérifier si elle appartient à l'utilisateur
        Optional<CampagneEntity> existingCampaign = campagneRepository.findById(id);

        if (existingCampaign.isPresent() && existingCampaign.get().getUserId().equals(userId)) {
            // Si la campagne existe et appartient à l'utilisateur, mettre à jour les champs nécessaires
            CampagneEntity updatedCampaign = existingCampaign.get();
            updatedCampaign.setTitre(campaign.getTitre());
            updatedCampaign.setVersion(campaign.getVersion());
            updatedCampaign.setNbRapports(campaign.getNbRapports());
            updatedCampaign.setDate(campaign.getDate());
            updatedCampaign.setNbExecution(campaign.getNbExecution());
            updatedCampaign.setId2(campaign.getId2());
            // Ajoutez d'autres champs à mettre à jour si nécessaire

            // Sauvegarder la campagne mise à jour dans la base de données
            return Optional.of(campagneRepository.save(updatedCampaign));
        }

        return Optional.empty(); // Si la campagne n'existe pas ou n'appartient pas à l'utilisateur
    }

    // Récupérer une campagne par ID
    public Optional<CampagneEntity> getCampaignById(String id) {
        return campagneRepository.findById(id);
    }

    // Mettre à jour une campagne existante
    public Optional<CampagneEntity> updateCampaign(String id, CampagneEntity updatedCampaign) {
        return campagneRepository.findById(id).map(existingCampaign -> {
            updatedCampaign.setId(existingCampaign.getId());
            updatedCampaign.setCreatedAt(existingCampaign.getCreatedAt());
            updatedCampaign.setUpdatedAt(LocalDate.now());
            return campagneRepository.save(updatedCampaign);
        });
    }

    // Supprimer une campagne
    public boolean deleteCampaign(String id) {
        if (campagneRepository.existsById(id)) {
            campagneRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Dupliquer une campagne
    public Optional<CampagneEntity> duplicateCampaign(String id) {
        return campagneRepository.findById(id).map(existingCampaign -> {
            CampagneEntity newCampaign = new CampagneEntity();
            newCampaign.setTitre(existingCampaign.getTitre());
            newCampaign.setVersion(existingCampaign.getVersion());
            newCampaign.setNbRapports(existingCampaign.getNbRapports());
            newCampaign.setDate(existingCampaign.getDate());
            newCampaign.setNbExecution(existingCampaign.getNbExecution());
            newCampaign.setStatus(existingCampaign.getStatus());
            newCampaign.setStartDate(existingCampaign.getStartDate());
            newCampaign.setEndDate(existingCampaign.getEndDate());
            newCampaign.setCreatedAt(LocalDate.now());
            newCampaign.setUpdatedAt(LocalDate.now());
            return campagneRepository.save(newCampaign);
        });
    }
}
