import React from "react";

import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../contexts/auth-context";

const ProtectedRoutes = () => {
	// TODO: Use authentication token
	const {accessToken} = useAuthContext();

	return accessToken ? <Outlet /> : <Navigate to="/login"  replace />;
};

export default ProtectedRoutes;