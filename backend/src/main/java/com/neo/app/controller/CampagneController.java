package com.neo.app.controller;
import com.neo.app.service.CampagneService;
import com.neo.app.documents.CampagneEntity;
import com.neo.app.repository.CampagneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


@RestController
    @RequestMapping("/api/campaigns")
    public class CampagneController {
        private static final Logger logger = LoggerFactory.getLogger(CampagneController.class);
        private final CampagneService campagneService;

        public CampagneController(CampagneService campagneService) {
            this.campagneService = campagneService;
        }

        @GetMapping
        public List<CampagneEntity> getAllCampaigns() {
            return campagneService.getAllCampaigns();
        }
        @PostMapping
        public ResponseEntity<CampagneEntity> createCampaign(@RequestBody CampagneEntity campaign) {
            logger.info("Requête reçue pour créer la campagne: {}", campaign.getTitre());

            // Validation des champs si nécessaire
            if (campaign.getTitre() == null || campaign.getTitre().isEmpty()) {
                logger.error("Le titre de la campagne est manquant");
                return ResponseEntity.badRequest().body(null); // Titre manquant
            }

            if (campaign.getDate() == null) {
                logger.error("La date de la campagne est manquante");
                return ResponseEntity.badRequest().body(null); // Date manquante
            }

            if (campaign.getNbExecution() == 0) {
                logger.error("Le nombre d'exécutions est manquant");
                return ResponseEntity.badRequest().body(null); // Nb d'exécution manquant
            }

            // Validation de la date si elle n'est pas dans le futur
            if (campaign.getDate().isAfter(LocalDate.now())) {
                logger.error("La date de la campagne ne peut pas être dans le futur");
                return ResponseEntity.badRequest().body(null); // Date dans le futur
            }

            try {
                logger.debug("Détails de la campagne: {}", campaign);

                // Enregistrement de la campagne dans la base de données avec id2
                CampagneEntity createdCampaign = campagneService.createCampaign(campaign);

                logger.info("Campagne créée avec succès: {}", createdCampaign.getTitre());
                return ResponseEntity.ok(createdCampaign); // Retourne la campagne créée avec un statut 200
            } catch (Exception e) {
                logger.error("Erreur lors de la création de la campagne: {}", campaign.getTitre(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Erreur serveur
            }
        }

        @PutMapping("/{id}")
        @CrossOrigin(origins = "http://localhost:4200")
        public ResponseEntity<CampagneEntity> updateCampaign(@PathVariable String id, @RequestBody CampagneEntity campaign) {
            return campagneService.updateCampaign(id, campaign)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
    @PutMapping("/user/{userId}/{id}")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<CampagneEntity> updateCampaignByUserId(@PathVariable String userId, @PathVariable String id, @RequestBody CampagneEntity campaign) {
        return campagneService.updateCampaignByUserId(userId, id, campaign)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

        @DeleteMapping("/{id}")
        @CrossOrigin(origins = "http://localhost:4200")
        public ResponseEntity<Void> deleteCampaign(@PathVariable String id) {
            if (campagneService.deleteCampaign(id)) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }

        @PostMapping("/{id}/duplicate")
        @CrossOrigin(origins = "http://localhost:4200")
        public ResponseEntity<CampagneEntity> duplicateCampaign(@PathVariable String id) {
            return campagneService.duplicateCampaign(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        @GetMapping("/export")
        public ResponseEntity<String> exportCampaigns() {
            // Implémentez ici la logique pour générer un fichier d'export.
            return ResponseEntity.ok("Campaign export feature not yet implemented.");
        }
    @GetMapping("/user/{userId}")
    public List<CampagneEntity> getCampaignsByUserId(@PathVariable String userId) {
        return campagneService.getCampaignsByUserId(userId);
    }



}
