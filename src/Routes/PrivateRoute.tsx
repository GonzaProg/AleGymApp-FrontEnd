import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import type { JSX } from "react/jsx-dev-runtime";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
    