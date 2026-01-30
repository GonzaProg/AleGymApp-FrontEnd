import { createContext, useContext, useEffect, useState } from "react";
import { authTokenService } from "../API/Auth/AuthTokenService";
import { AuthApi } from "../API/Auth/AuthApi";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTokens = async () => {
    const refreshToken = authTokenService.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const response = await AuthApi.refresh(refreshToken);

    const wasRemembered = !!localStorage.getItem("refreshToken");
    const user = authTokenService.getUser();

    authTokenService.setTokens(
      {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
      },
      user,
      wasRemembered
    );
  };

  useEffect(() => {
    const init = async () => {
      const hasSession = authTokenService.initializeSession(refreshTokens);

      if (hasSession) {
        setIsAuthenticated(true);
      } else {
        authTokenService.clearTokens();
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
