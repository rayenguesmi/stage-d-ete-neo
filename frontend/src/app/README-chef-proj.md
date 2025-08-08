# Interface Chef de Projet - NeoTM

## Vue d'ensemble

Cette implémentation ajoute une interface complète pour le rôle "chef proj" dans l'application NeoTM, permettant aux chefs de projet de gérer les assignations d'utilisateurs aux projets 1 et 2.

## Composants créés

### 1. Layout Chef de Projet
- **Fichier**: `chef-proj-layout/`
- **Description**: Layout principal avec sidebar et navigation pour les chefs de projet
- **Fonctionnalités**:
  - Navigation par menu déroulant
  - Design cohérent avec l'interface admin existante
  - Sections pour gestion projets, assignation, équipes, suivi et planification

### 2. Dashboard Chef de Projet
- **Fichier**: `chef-proj-dashboard/`
- **Description**: Tableau de bord principal avec vue d'ensemble
- **Fonctionnalités**:
  - Statistiques des assignations par projet
  - Actions rapides pour assignation
  - Vue d'ensemble des projets avec équipes
  - Activités récentes

### 3. Composant d'Assignation
- **Fichier**: `assign-users/`
- **Description**: Interface pour assigner/désassigner des utilisateurs
- **Fonctionnalités**:
  - Sélection de projet (Neolians ou Vaudoise)
  - Liste des utilisateurs disponibles avec recherche
  - Liste des utilisateurs assignés
  - Assignation/désassignation en temps réel
  - Notifications de succès/erreur

### 4. Guard de Sécurité
- **Fichier**: `chef-proj-role.guard.ts`
- **Description**: Protection des routes pour le rôle chef de projet
- **Fonctionnalités**:
  - Vérification du rôle "chef proj" via Keycloak
  - Redirection automatique si accès non autorisé

## Intégration dans l'application

### Routes ajoutées
```typescript
{
  path: 'chef-proj',
  component: ChefProjLayoutComponent,
  canActivate: [ChefProjRoleGuard],
  children: [
    { path: 'dashboard', component: ChefProjDashboardComponent },
    { path: 'assign-projet1', component: AssignUsersComponent },
    { path: 'assign-projet2', component: AssignUsersComponent },
    // ... autres routes
  ]
}
```

### Mise à jour du AuthGuard
Le AuthGuard principal a été mis à jour pour rediriger automatiquement les utilisateurs avec le rôle "chef proj" vers `/chef-proj/dashboard`.

### Modules à mettre à jour
1. **app.module.ts**: Ajouter les nouveaux composants dans les déclarations
2. **app-routing.module.ts**: Intégrer les nouvelles routes
3. **AuthGuard.ts**: Ajouter la logique de redirection pour le rôle chef de projet

## Fonctionnalités principales

### Gestion des Projets
- Vue d'ensemble des projets 1 et 2
- Statistiques des membres assignés
- Suivi du progrès (simulé)

### Assignation d'Utilisateurs
- Interface intuitive pour assigner des utilisateurs
- Recherche et filtrage des utilisateurs
- Gestion en temps réel des assignations
- Notifications visuelles

### Tableau de Bord
- Cartes statistiques pour chaque projet
- Actions rapides d'assignation
- Vue d'ensemble des équipes
- Historique des activités

## Design et UX

### Cohérence visuelle
- Même palette de couleurs que l'interface admin
- Icônes Font Awesome cohérentes
- Animations et transitions fluides
- Design responsive

### Navigation
- Sidebar avec menus déroulants
- Navigation contextuelle
- Breadcrumbs implicites via les titres

## Données simulées

L'implémentation utilise des données simulées pour démonstration :
- Liste d'utilisateurs avec rôles
- Assignations par défaut
- Activités récentes
- Statistiques de progression

## Installation et utilisation

1. Copier les nouveaux composants dans le projet
2. Mettre à jour `app.module.ts` avec les nouveaux composants
3. Mettre à jour `app-routing.module.ts` avec les nouvelles routes
4. Mettre à jour `AuthGuard.ts` pour la redirection automatique
5. S'assurer que le rôle "chef proj" existe dans Keycloak
6. Assigner le rôle à l'utilisateur rayen@gmail.com

## Extensibilité

L'architecture permet facilement d'ajouter :
- Plus de projets
- Fonctionnalités de planification avancées
- Intégration avec des APIs backend
- Rapports et analytics
- Notifications en temps réel

## Notes techniques

- Compatible avec Angular 14+
- Utilise Keycloak pour l'authentification
- Design responsive (mobile-friendly)
- Code TypeScript typé
- Composants réutilisables

