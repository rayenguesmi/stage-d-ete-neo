package com.neo.app.service;

import com.neo.app.repository.DocumentRepository;
import com.neo.app.documents.DocumentEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.security.Key;
import java.util.Date;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;
    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    private static final String AES = "AES";  // Algorithme de cryptage
    private static final String SECRET_KEY = "1234567890123456"; // 16 bytes pour AES-128

    // Sauvegarder un document
    public void saveDocument(MultipartFile file) throws Exception {
        try {
            // Convertir le fichier en tableau de bytes
            byte[] data = file.getBytes();

            // Crypter le fichier
            byte[] encryptedData = encrypt(data);

            // Créer un objet DocumentEntity pour stocker les informations sur le fichier
            DocumentEntity document = new DocumentEntity();
            document.setFilename(file.getOriginalFilename());
            document.setFiletype(file.getContentType());
            document.setUploadDate(new Date());
            document.setData(encryptedData);

            // Sauvegarder le document crypté dans la base de données MongoDB
            documentRepository.save(document);
        } catch (IOException e) {
            logger.error("Erreur lors de la lecture du fichier", e);
            throw new Exception("Erreur lors de la lecture du fichier", e);
        }
    }

    // Récupérer un document par ID
    public DocumentEntity getDocumentById(UUID id) {
        return documentRepository.findById(id.toString()).orElse(null);
    }

    // Méthode pour crypter les données
    private byte[] encrypt(byte[] data) throws Exception {
        Key key = new SecretKeySpec(SECRET_KEY.getBytes(), AES);
        Cipher cipher = Cipher.getInstance(AES);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data);
    }

    // Récupérer tous les documents
    public List<DocumentEntity> getAllDocuments() {
        return documentRepository.findAll();
    }
}
