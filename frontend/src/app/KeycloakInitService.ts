import { KeycloakService } from 'keycloak-angular';
import { environment } from '../environments/environment';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        pkceMethod: 'S256',
        redirectUri: window.location.origin,
        checkLoginIframe: false,
        onLoad: 'check-sso'
      },
    }).then((authenticated: boolean) => {
      // The redirection logic will now be handled by AuthGuard and app.component.ts
      return authenticated;
    });
}

