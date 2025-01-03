package com.neo.app.controller;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.neo.app.service.DocumentService;
import com.neo.app.documents.DocumentEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.core.io.ByteArrayResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class DocumentController {
    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);

    @Autowired
    private DocumentService documentService;

    // Méthode pour récupérer un fichier par ID
    @GetMapping("/files/{id}")
    public ResponseEntity<Resource> getFile(@PathVariable String id) {
        try {
            // Convertir l'ID en UUID si nécessaire
            UUID uuid = UUID.fromString(id);

            // Récupérer le fichier depuis la base de données en utilisant l'UUID
            DocumentEntity document = documentService.getDocumentById(uuid);

            if (document != null && document.getData() != null) {
                // Vérifier que le type MIME du fichier est valide
                String fileType = document.getFiletype();
                if (fileType == null || fileType.isEmpty()) {
                    fileType = "application/octet-stream"; // Par défaut, si le type MIME est manquant
                }

                // Préparer le fichier pour le téléchargement
                ByteArrayResource resource = new ByteArrayResource(document.getData());

                // Retourner la réponse avec le fichier
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(fileType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFilename() + "\"")
                        .body(resource);
            } else {
                // Fichier non trouvé ou vide
                logger.warn("Fichier avec l'ID {} non trouvé ou vide", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null);  // Peut-être ajouter un message d'erreur ici
            }
        } catch (IllegalArgumentException e) {
            // Si l'ID n'est pas un UUID valide
            logger.error("ID invalide : {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);  // Renvoi d'une erreur de format d'ID
        } catch (Exception e) {
            // Autres erreurs générales
            logger.error("Erreur lors de la récupération du fichier", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);  // Il serait préférable de retourner une erreur structurée ici
        }
    }


    // Méthode pour gérer l'upload d'un document
    @PostMapping("/upload")
    @CrossOrigin(origins = "http://localhost:4200")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        logger.debug("Début du téléchargement du fichier: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            logger.error("Le fichier est vide.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Le fichier ne peut pas être vide."));
        }

        try {
            // Validation du type de fichier
            if (!isValidFileType(file)) {
                logger.error("Type de fichier non autorisé: {}", file.getContentType());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Type de fichier non autorisé. Veuillez télécharger un fichier PDF, CSV ou XML."));
            }

            // Sauvegarde du fichier dans la base de données ou dans le système de fichiers
            documentService.saveDocument(file);

            logger.debug("Téléchargement du fichier réussi.");

            // Retourner une réponse structurée en JSON
            return ResponseEntity.status(HttpStatus.CREATED).body(new SuccessResponse("Document téléchargé avec succès."));
        } catch (MaxUploadSizeExceededException exc) {
            logger.error("Fichier trop volumineux : ", exc);
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(new ErrorResponse("Le fichier est trop volumineux. Taille maximale autorisée : 10MB."));
        } catch (Exception e) {
            logger.error("Erreur lors du téléchargement du fichier", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Échec du téléchargement du document."));
        }
    }

    // Méthode pour récupérer la liste des fichiers téléchargés
    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/files")
    public ResponseEntity<List<DocumentEntity>> getFiles() {
        try {
            List<DocumentEntity> documents = documentService.getAllDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des fichiers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Méthode pour valider le type de fichier
    private boolean isValidFileType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (contentType.equals("application/pdf")
                || contentType.equals("text/csv")
                || contentType.equals("application/xml"));
    }

    // Classe pour structurer la réponse de succès
    public static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    // Classe pour structurer la réponse d'erreur
    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    // Gestion des erreurs générales
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        logger.error("Erreur inattendue: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/json")
                .body("{\"error\": \"Une erreur s'est produite.\"}");
    }

    // Gestion des erreurs spécifiques à la taille du fichier
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        logger.error("Fichier trop volumineux : ", exc);
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .header("Content-Type", "application/json")
                .body("{\"error\": \"Le fichier est trop volumineux. Taille maximale autorisée : 10MB.\"}");
    }
}
