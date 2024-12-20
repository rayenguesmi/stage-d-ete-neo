package com.neo.app.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.neo.app.repository.DocumentRepository;
import com.neo.app.documents.DocumentEntity;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;


    // Sauvegarder un document
    public void saveDocument(MultipartFile file) throws IOException {
        byte[] data = file.getBytes();  // Convertir le fichier en byte[]

        // Créer un objet DocumentEntity
        DocumentEntity document = new DocumentEntity();
        document.setFilename(file.getOriginalFilename());
        document.setFiletype(file.getContentType());
        document.setUploadDate(new Date());  // Date actuelle pour l'upload
        document.setData(data);

        // Sauvegarder le document dans MongoDB
        documentRepository.save(document);
    }

    // Récupérer tous les documents
    public List<DocumentEntity> getAllDocuments() {
        return documentRepository.findAll();
    }



    public List<Map<String, Object>> getFilesTree() {
        List<DocumentEntity> documents = documentRepository.findAll();


        Map<String, List<DocumentEntity>> groupedByType = documents.stream()
                .collect(Collectors.groupingBy(doc -> {
                    if ("text/csv".equals(doc.getFiletype())) return "CSV";
                    if ("application/xml".equals(doc.getFiletype())) return "XML";
                    if ("text/xml".equals(doc.getFiletype())) return "XML";
                    if ("application/pdf".equals(doc.getFiletype())) return "PDF";
                    return "Other";
                }));


        List<Map<String, Object>> treeStructure = new ArrayList<>();
        groupedByType.forEach((type, docs) -> {
            Map<String, Object> parentNode = new HashMap<>();
            parentNode.put("name", type);
            parentNode.put("children", docs.stream().map(doc -> {
                Map<String, Object> childNode = new HashMap<>();
                childNode.put("name", doc.getFilename());
                childNode.put("type", doc.getFiletype());
                childNode.put("uploadDate", formatDate(doc.getUploadDate()));
                return childNode;
            }).collect(Collectors.toList()));
            treeStructure.add(parentNode);
        });

        return treeStructure;
    }


    private String formatDate(Date date) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return date != null ? formatter.format(date) : "Unknown date";
    }
}

