import {
    createContext,
    useContext,
    useState,
} from "react";

import { jwtDecode } from "jwt-decode";
import { setAuthToken } from "../services/api";

const AuthContext = createContext(null);

function getUserFromToken(jwt) {
    try {
        const decoded = jwtDecode(jwt);

        const rawRole =
            decoded.role ??
            decoded.roles?.[0] ??
            decoded.authorities?.[0];

        const role =
            typeof rawRole === "string"
                ? rawRole.replace(/^ROLE_/, "")
                : rawRole?.authority?.replace(/^ROLE_/, "");

        return {
            email: decoded.sub,
            role: role ?? null,
        };
    } catch (error) {
        console.error("Invalid JWT:", error);
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    const login = (jwt) => {
        const decodedUser = getUserFromToken(jwt);

        setAuthToken(jwt);
        setToken(jwt);
        setUser(decodedUser);
    };

    const logout = () => {
        setAuthToken(null);
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: Boolean(token),
                isAdmin: user?.role === "ADMIN",
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;
}