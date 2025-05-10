import { Navigate } from "react-router-dom";
import { auth } from "../pages/firebaseConfig";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return auth.currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
