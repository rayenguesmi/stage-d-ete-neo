package com.neo.app.controller;
import com.neo.app.service.DocumentService;
import com.neo.app.documents.DocumentEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    // Permettre CORS uniquement pour cette méthode
    @CrossOrigin(origins = "http://localhost:4200")  // Autoriser CORS depuis le frontend Angular
    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            documentService.saveDocument(file);
            return ResponseEntity.ok("Document téléchargé avec succès !");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Échec du téléchargement du document.");
        }
    }

    @CrossOrigin(origins = "http://localhost:4200")  // Autoriser CORS pour ce point aussi
    @GetMapping("/files")
    public ResponseEntity<List<DocumentEntity>> getFiles() {
        try {
            List<DocumentEntity> documents = documentService.getAllDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.status(413).body("Le fichier est trop volumineux. Taille maximale autorisée : 10MB.");
    }
}