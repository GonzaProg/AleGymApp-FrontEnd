import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../useAuthUser"; 

export const useHome = () => {
  const navigate = useNavigate();
  
  // 1. Extraemos isLoading también
  const { currentUser, isEntrenador, isAdmin, isLoading } = useAuthUser();

  const goToMyRoutines = () => navigate("/my-routines");
  const goToCreateRoutine = () => navigate("/create-routine");
  const goToDeleteRoutine = () => navigate("/delete-routine");
  const goToCreateUser = () => navigate("/create-user");
  const goToExercises = () => navigate("/ejercicios");
  const goToCreateNotification = () => navigate("/notifications/create");
  const goToPlans = () => navigate("/planes");
  const goToRenew = () => navigate("/planes/renovar-gestion");

  return {
    user: currentUser, 
    isEntrenador,
    isAdmin,
    isLoading,
    goToMyRoutines,
    goToCreateRoutine,
    goToDeleteRoutine,
    goToCreateUser,
    goToExercises,
    goToCreateNotification,
    goToPlans,
    goToRenew
  };
};