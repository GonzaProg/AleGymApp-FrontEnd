import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../useAuthUser"; 

export const useHome = () => {
  const navigate = useNavigate();
  
  // 1. Extraemos isLoading también
  const { currentUser, isEntrenador, isAdmin, isLoading } = useAuthUser();

  const goToMyRoutines = () => navigate("/my-routines");
  const goToUserPlan = () => navigate("/planes/mi-plan");

  return {
    user: currentUser, 
    isEntrenador,
    isAdmin,
    isLoading,
    goToMyRoutines,
    goToUserPlan,
  };
};