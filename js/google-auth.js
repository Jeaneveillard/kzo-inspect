// js/google-auth.js
// OAuth2 Google Identity Services — scopes gmail.send + drive.file
// Adapté de Amboul/JEC/google_drive.js

const _GA_TOKEN_KEY  = 'kzo_google_token';
const _GA_EXPIRY_KEY = 'kzo_google_expiry';
const _GA_SCOPES     = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file';

let _gaTokenClient = null;
let _gaResolve     = null;
let _gaReject      = null;

export function initGoogleAuth(clientId) {
  if (typeof google === 'undefined' || !google.accounts?.oauth2) return false;
  if (!clientId) return false;
  _gaTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: _GA_SCOPES,
    callback: (response) => {
      if (response.error) {
        _gaReject?.(new Error(response.error));
      } else {
        sessionStorage.setItem(_GA_TOKEN_KEY, response.access_token);
        sessionStorage.setItem(_GA_EXPIRY_KEY, String(Date.now() + (response.expires_in - 60) * 1000));
        _gaResolve?.();
      }
      _gaResolve = null;
      _gaReject  = null;
    },
  });
  return true;
}

export function isGoogleConnected() {
  const token  = sessionStorage.getItem(_GA_TOKEN_KEY);
  const expiry = parseInt(sessionStorage.getItem(_GA_EXPIRY_KEY) || '0', 10);
  return !!token && Date.now() < expiry;
}

export function getGoogleToken() {
  return sessionStorage.getItem(_GA_TOKEN_KEY) || '';
}

export function googleAuthenticate(clientId) {
  if (!_gaTokenClient) initGoogleAuth(clientId);
  if (isGoogleConnected()) return Promise.resolve();
  if (!_gaTokenClient) {
    return Promise.reject(new Error(
      'Google Identity Services non disponible. Vérifiez votre connexion internet et rechargez la page.'
    ));
  }
  return new Promise((resolve, reject) => {
    _gaResolve = resolve;
    _gaReject  = reject;
    _gaTokenClient.requestAccessToken({ prompt: '' });
  });
}

export function googleDisconnect() {
  const token = sessionStorage.getItem(_GA_TOKEN_KEY);
  if (token && typeof google !== 'undefined') {
    google.accounts.oauth2.revoke(token, () => {});
  }
  sessionStorage.removeItem(_GA_TOKEN_KEY);
  sessionStorage.removeItem(_GA_EXPIRY_KEY);
}
