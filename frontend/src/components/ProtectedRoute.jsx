import { Navigate } from "react-router-dom";
import { useCheckLoginQuery } from "../Reduxe/Api";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  const { data, isLoading, isError } = useCheckLoginQuery(undefined, {
    skip: !token,
  });

  if (!token) return <Navigate to="/" replace />;

  if (isLoading) return <p>Checking authentication...</p>;

  if (isError) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
