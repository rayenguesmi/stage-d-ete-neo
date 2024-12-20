package com.neo.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Permettre les requêtes CORS pour localhost:4200
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")  // Remplacez avec l'URL de votre frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE")  // Autorise certaines méthodes HTTP
                .allowedHeaders("*")  // Autorise tous les en-têtes
                .allowCredentials(true);  // Permet l'envoi de cookies si nécessaire
    }
}
