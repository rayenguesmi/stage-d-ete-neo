package com.neo.app.controller;

import com.neo.app.documents.UserEntity;
import com.neo.app.service.UserService;
import com.neo.app.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuditLogService auditLogService;

    // Création d'un utilisateur (Admin seulement)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN_GENERAL')")
    public ResponseEntity<?> createUser(@RequestBody UserEntity user, HttpServletRequest request) {
        try {
            UserEntity createdUser = userService.createUser(user);

            // Log de l'audit avec informations de la requête
            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "CREATE",
                    "USER",
                    createdUser.getId(),
                    "User created via API: " + createdUser.getUsername(),
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors de la création de l'utilisateur", e.getMessage()));
        }
    }

    // Mise à jour d'un utilisateur
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or @userService.isCurrentUser(#userId)")
    public ResponseEntity<?> updateUser(@PathVariable String userId,
                                        @RequestBody UserEntity user,
                                        HttpServletRequest request) {
        try {
            UserEntity updatedUser = userService.updateUser(userId, user);

            // Log de l'audit
            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "UPDATE",
                    "USER",
                    updatedUser.getId(),
                    "User updated via API: " + updatedUser.getUsername(),
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors de la mise à jour de l'utilisateur", e.getMessage()));
        }
    }

    // Suppression d'un utilisateur (Admin seulement)
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN_GENERAL')")
    public ResponseEntity<?> deleteUser(@PathVariable String userId, HttpServletRequest request) {
        try {
            userService.deleteUser(userId);

            // Log de l'audit
            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "DELETE",
                    "USER",
                    userId,
                    "User deleted via API",
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(new SuccessResponse("Utilisateur supprimé avec succès"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors de la suppression de l'utilisateur", e.getMessage()));
        }
    }

    // Récupération d'un utilisateur par ID
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET') or @userService.isCurrentUser(#userId)")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            Optional<UserEntity> user = userService.getUserById(userId);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Utilisateur non trouvé", "Aucun utilisateur trouvé avec l'ID: " + userId));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération de l'utilisateur", e.getMessage()));
        }
    }

    // Récupération de tous les utilisateurs (Admin et Chef de projet)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserEntity> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des utilisateurs", e.getMessage()));
        }
    }

    // Récupération des utilisateurs actifs
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getActiveUsers() {
        try {
            List<UserEntity> users = userService.getActiveUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des utilisateurs actifs", e.getMessage()));
        }
    }

    // Récupération des utilisateurs par rôle
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            List<UserEntity> users = userService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des utilisateurs par rôle", e.getMessage()));
        }
    }

    // Récupération des utilisateurs par projet
    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN_GENERAL') or hasRole('CHEF_PROJET')")
    public ResponseEntity<?> getUsersByProject(@PathVariable String projectId) {
        try {
            List<UserEntity> users = userService.getUsersByProject(projectId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération des utilisateurs par projet", e.getMessage()));
        }
    }

    // Activation/Désactivation d'un utilisateur (Admin seulement)
    @PatchMapping("/{userId}/toggle-status")
    @PreAuthorize("hasRole('ADMIN_GENERAL')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String userId, HttpServletRequest request) {
        try {
            UserEntity updatedUser = userService.toggleUserStatus(userId);

            String action = updatedUser.getIsActive() ? "ACTIVATE" : "DEACTIVATE";
            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    action,
                    "USER",
                    updatedUser.getId(),
                    "User " + action.toLowerCase() + "d via API: " + updatedUser.getUsername(),
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors du changement de statut de l'utilisateur", e.getMessage()));
        }
    }

    // Récupération du profil de l'utilisateur connecté
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(HttpServletRequest request) {
        try {
            String currentUserId = getCurrentUserId(request);
            Optional<UserEntity> user = userService.getUserById(currentUserId);

            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Profil non trouvé", "Impossible de récupérer le profil utilisateur"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la récupération du profil", e.getMessage()));
        }
    }

    // Mise à jour du profil de l'utilisateur connecté
    @PutMapping("/profile")
    public ResponseEntity<?> updateCurrentUserProfile(@RequestBody UserEntity user, HttpServletRequest request) {
        try {
            String currentUserId = getCurrentUserId(request);

            // Limiter les champs modifiables pour un utilisateur normal
            UserEntity limitedUpdate = new UserEntity();
            limitedUpdate.setFirstName(user.getFirstName());
            limitedUpdate.setLastName(user.getLastName());
            limitedUpdate.setEmail(user.getEmail());

            UserEntity updatedUser = userService.updateUser(currentUserId, limitedUpdate);

            auditLogService.logAction(
                    getCurrentUserId(request),
                    getCurrentUsername(request),
                    "UPDATE_PROFILE",
                    "USER",
                    updatedUser.getId(),
                    "User profile updated via API",
                    getClientIpAddress(request),
                    request.getHeader("User-Agent"),
                    request.getSession().getId()
            );

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erreur lors de la mise à jour du profil", e.getMessage()));
        }
    }

    // Méthodes utilitaires
    private String getCurrentUserId(HttpServletRequest request) {
        // À implémenter selon votre système d'authentification Keycloak
        // Exemple : récupération depuis le token JWT
        return request.getHeader("X-User-ID"); // Placeholder
    }

    private String getCurrentUsername(HttpServletRequest request) {
        // À implémenter selon votre système d'authentification Keycloak
        return request.getHeader("X-Username"); // Placeholder
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    // Classes pour les réponses
    public static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}

