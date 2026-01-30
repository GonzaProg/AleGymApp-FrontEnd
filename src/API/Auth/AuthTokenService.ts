import type { User } from "../../Hooks/useAuthUser";

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
    private readonly USER_KEY = 'user';
    
    private refreshTimeout: number | null = null;

    /**
     * Guarda tokens y usuario en el almacenamiento elegido (Local o Session)
     */
    setTokens(tokenPair: TokenPair, user: any, rememberMe: boolean): void {
        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;

        // Limpiamos el almacenamiento contrario para evitar conflictos
        this.clearTokensFrom(otherStorage);

        storage.setItem(this.ACCESS_TOKEN_KEY, tokenPair.accessToken);
        storage.setItem(this.REFRESH_TOKEN_KEY, tokenPair.refreshToken);
        storage.setItem(this.EXPIRES_IN_KEY, tokenPair.expiresIn.toString());
        storage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    /**
     * Busca en ambos almacenamientos (dando prioridad a LocalStorage)
     */
    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY) || sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    getUser(): User | null {
        const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    }

    getTokens(): AuthState {
        return {
            accessToken: this.getAccessToken(),
            refreshToken: this.getRefreshToken(),
            expiresIn: parseInt(localStorage.getItem(this.EXPIRES_IN_KEY) || sessionStorage.getItem(this.EXPIRES_IN_KEY) || '0'),
        };
    }

    clearTokens(): void {
        this.clearTokensFrom(localStorage);
        this.clearTokensFrom(sessionStorage);
        this.clearRefreshTimeout();
    }

    private clearTokensFrom(storage: Storage) {
        storage.removeItem(this.ACCESS_TOKEN_KEY);
        storage.removeItem(this.REFRESH_TOKEN_KEY);
        storage.removeItem(this.EXPIRES_IN_KEY);
        storage.removeItem(this.USER_KEY);
    }

    // --- AUTO REFRESH ---
    setupAutoRefresh(onRefresh: () => Promise<void>): void {
        const expiresIn = this.getTokens().expiresIn || 0;
        
        // Asumimos que expiresIn viene en SEGUNDOS (ej: 900 para 15 min)
        // Convertimos a ms y restamos 1 minuto de margen de seguridad
        const refreshDelay = (expiresIn * 1000) - 60000; 

        // Si el token expira pronto o ya expiró, no programamos timeout (el interceptor lo manejará)
        if (refreshDelay > 0) {
            this.clearRefreshTimeout();
            this.refreshTimeout = setTimeout(() => {
                console.log("⏰ Auto-refresh programado ejecutándose...");
                onRefresh().catch(console.error);
            }, refreshDelay);
        }
    }

    clearRefreshTimeout(): void {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
    }

    /**
     * Inicializa la sesión. Retorna TRUE si hay datos válidos para mostrar la app inmediatamente.
     */
    initializeSession(onRefresh: () => Promise<void>): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) return false;

    this.setupAutoRefresh(onRefresh);
    return true;
    }

}

export const authTokenService = new AuthTokenService();