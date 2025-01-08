import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  exp?: number;
  id: string;
  email: string;
}

export const TokenService = {
  get: () => sessionStorage.getItem('token'),
  
  set: (token: string) => {
    sessionStorage.setItem('token', token);
    // Set up expiration timer
    const payload = TokenService.decode(token);
    if (payload.exp) {
      const expirationTime = payload.exp * 1000;
      const timeoutId = setTimeout(() => {
        TokenService.remove();
        window.dispatchEvent(new Event('token-expired'));
      }, expirationTime - Date.now());
      
      // Store timeout ID to clear if needed
      sessionStorage.setItem('expiration-timer', timeoutId.toString());
    }
  },
  
  remove: () => {
    sessionStorage.removeItem('token');
    const timeoutId = sessionStorage.getItem('expiration-timer');
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      sessionStorage.removeItem('expiration-timer');
    }
  },
  
  decode: (token: string) => jwtDecode<TokenPayload>(token),
  
  isValid: (token: string) => {
    try {
      const payload = TokenService.decode(token);
      if (!payload.exp) return false;
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}; 