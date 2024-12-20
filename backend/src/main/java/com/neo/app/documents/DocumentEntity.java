package com.neo.app.documents;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "documents")  // Spécifie la collection MongoDB
public class DocumentEntity {

    @Id
    private String id;  // ID MongoDB (généré automatiquement)

    private String filename;
    private String filetype;  // MIME type of the file (e.g., application/pdf)
    private Date uploadDate;
    private byte[] data;

    // Constructeurs
    public DocumentEntity() {}

    public DocumentEntity(String filename, String filetype, Date uploadDate, byte[] data) {
        this.filename = filename;
        this.filetype = filetype;
        this.uploadDate = uploadDate;
        this.data = data;
    }

    // Getters et setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getFiletype() {
        return filetype;
    }

    public void setFiletype(String filetype) {
        this.filetype = filetype;
    }

    public Date getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(Date uploadDate) {
        this.uploadDate = uploadDate;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }
}
