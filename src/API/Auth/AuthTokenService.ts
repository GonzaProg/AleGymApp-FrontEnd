/**
 * SERVICIO DE AUTENTICACIÓN Y TOKENS - FRONTEND
 * Gestión segura de access y refresh tokens siguiendo best practices
 */


interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    expiresIn: number | null;
}

class AuthTokenService {
    private readonly ACCESS_TOKEN_KEY = 'accessToken';
    private readonly REFRESH_TOKEN_KEY = 'refreshToken';
    private readonly EXPIRES_IN_KEY = 'expiresIn';
    private readonly TOKEN_TIMESTAMP_KEY = 'tokenTimestamp';
    private readonly USER_KEY = 'user';
    
    private refreshTimeout: number | null = null;

    /**
     * Almacena el par de tokens de forma segura
     */
    setTokens(tokenPair: TokenPair): void {
        const now = Date.now();
        localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenPair.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenPair.refreshToken);
        localStorage.setItem(this.EXPIRES_IN_KEY, tokenPair.expiresIn.toString());
        localStorage.setItem(this.TOKEN_TIMESTAMP_KEY, now.toString());
    }

    /**
     * Obtiene el access token actual
     */
    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    /**
     * Obtiene el refresh token actual
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Obtiene ambos tokens
     */
    getTokens(): AuthState {
        return {
            accessToken: this.getAccessToken(),
            refreshToken: this.getRefreshToken(),
            expiresIn: parseInt(localStorage.getItem(this.EXPIRES_IN_KEY) || '0'),
        };
    }

    /**
     * Verifica si el access token está próximo a expirar (< 1 min)
     */
    isAccessTokenExpiringSoon(): boolean {
        const expiresIn = parseInt(localStorage.getItem(this.EXPIRES_IN_KEY) || '0');
        const timestamp = parseInt(localStorage.getItem(this.TOKEN_TIMESTAMP_KEY) || '0');
        const now = Date.now();
        const elapsedSeconds = (now - timestamp) / 1000;
        const remainingSeconds = expiresIn - elapsedSeconds;
        
        // Retorna true si quedan menos de 60 segundos
        return remainingSeconds < 60;
    }

    /**
     * Verifica si el access token ya expiró
     */
    isAccessTokenExpired(): boolean {
        const expiresIn = parseInt(localStorage.getItem(this.EXPIRES_IN_KEY) || '0');
        const timestamp = parseInt(localStorage.getItem(this.TOKEN_TIMESTAMP_KEY) || '0');
        const now = Date.now();
        const elapsedSeconds = (now - timestamp) / 1000;
        
        return elapsedSeconds > expiresIn;
    }

    /**
     * Limpia todos los tokens de sesión
     */
    clearTokens(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.EXPIRES_IN_KEY);
        localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.clearRefreshTimeout();
    }

    /**
     * Configura un timeout para renovar el token antes de que expire
     * (Se renueva 1 minuto antes de la expiración)
     */
    setupAutoRefresh(onRefresh: () => Promise<void>): void {
        const expiresIn = parseInt(localStorage.getItem(this.EXPIRES_IN_KEY) || '0');
        const refreshIn = (expiresIn - 60) * 1000; // 1 minuto antes de expirar

        if (refreshIn > 0) {
            this.refreshTimeout = setTimeout(() => {
                onRefresh().catch((error) => {
                    console.error('Error durante refresh automático:', error);
                });
            }, refreshIn);
        }
    }

    /**
     * Limpia el timeout de auto-refresh
     */
    clearRefreshTimeout(): void {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
    }

    /**
     * Inicializa la sesión verificando tokens existentes y configurando auto-refresh
     */
    initializeSession(onRefresh: () => Promise<void>): boolean {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();

        if (!accessToken || !refreshToken) {
            return false; // No hay tokens
        }

        if (this.isAccessTokenExpired()) {
            // Token expirado, intentar refresh inmediato
            onRefresh().catch((error) => {
                console.error('Error durante refresh inicial:', error);
                this.clearTokens(); // Limpiar si falla
            });
            return false; // Considerar como no inicializado hasta que se refresque
        }

        // Configurar auto-refresh para tokens válidos
        this.setupAutoRefresh(onRefresh);
        return true; // Sesión inicializada
    }
}

export const authTokenService = new AuthTokenService();
