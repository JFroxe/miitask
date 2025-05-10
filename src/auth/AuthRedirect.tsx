import { Navigate } from "react-router-dom";
import { auth } from "../pages/firebaseConfig";

const AuthRedirect = ({ children }: { children: JSX.Element }) => {
  return auth.currentUser ? <Navigate to="/TaskList" /> : children;
};

export default AuthRedirect;
