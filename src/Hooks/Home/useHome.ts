import { useNavigate } from "react-router-dom";

export const useHome = () => {
  const navigate = useNavigate();
  
  // Lógica de datos
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isEntrenador = user.rol === "Entrenador" || user.rol === "Admin";

  // Lógica de navegación (Handlers)
  const goToMyRoutines = () => navigate("/my-routines");
  const goToCreateRoutine = () => navigate("/create-routine");
  const goToDeleteRoutine = () => navigate("/delete-routine");
  const goToCreateUser = () => navigate("/create-user");
  const goToExercises = () => navigate("/ejercicios");
  const goToCreateNotification = () => navigate("/notifications/create");

  return {
    user,
    isEntrenador,
    goToMyRoutines,
    goToCreateRoutine,
    goToDeleteRoutine,
    goToCreateUser,
    goToExercises,
    goToCreateNotification
  };
};