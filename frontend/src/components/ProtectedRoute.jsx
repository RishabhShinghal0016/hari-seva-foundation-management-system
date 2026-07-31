import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Loader } from "./ui";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }
  return children;
}
