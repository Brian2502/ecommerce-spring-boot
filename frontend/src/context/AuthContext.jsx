
import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import { jwtDecode } from "jwt-decode";

import {
    setAuthToken,
    AUTH_TOKEN_KEY,
} from "../services/api";

const AuthContext = createContext(null);

function getUserFromToken(jwt) {
    if (!jwt) return null;

    try {
        const decoded = jwtDecode(jwt);

        // Kiểm tra thời hạn JWT
        if (
            !decoded.exp ||
            decoded.exp * 1000 <= Date.now()
        ) {
            return null;
        }

        if (!decoded.sub) {
            return null;
        }

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

// Khôi phục token khi reload trang
function getInitialToken() {
    const savedToken =
        localStorage.getItem(AUTH_TOKEN_KEY);

    return getUserFromToken(savedToken)
        ? savedToken
        : null;
}

export function AuthProvider({ children }) {

    const [token, setToken] = useState(getInitialToken);

    const user = getUserFromToken(token);

    const login = (jwt) => {
        const decodedUser = getUserFromToken(jwt);

        if (!decodedUser) {
            throw new Error("Invalid or expired JWT");
        }

        setAuthToken(jwt);
        setToken(jwt);
    };

    const logout = () => {
        setAuthToken(null);
        setToken(null);
    };

    // Xóa token không hợp lệ khi khởi tạo
    useEffect(() => {
        const savedToken =
            localStorage.getItem(AUTH_TOKEN_KEY);

        if (savedToken && !getUserFromToken(savedToken)) {
            setAuthToken(null);
        }
    }, []);

    // Tự động đăng xuất khi JWT hết hạn
    useEffect(() => {
        if (!token) return;

        const decoded = jwtDecode(token);

        const remainingTime =
            decoded.exp * 1000 - Date.now();

        if (remainingTime <= 0) {
            logout();
            return;
        }

        const timer = setTimeout(
            logout,
            remainingTime
        );

        return () => clearTimeout(timer);

    }, [token]);

    // Xử lý lỗi 401 từ Axios
    useEffect(() => {
        const handleExpired = () => {
            setToken(null);
        };

        window.addEventListener(
            "auth:expired",
            handleExpired
        );

        return () => {
            window.removeEventListener(
                "auth:expired",
                handleExpired
            );
        };
    }, []);

    // Đồng bộ đăng nhập giữa các tab
    useEffect(() => {
        const handleStorage = (event) => {
            if (
                event.key === AUTH_TOKEN_KEY ||
                event.key === null
            ) {
                setToken(getInitialToken());
            }
        };

        window.addEventListener(
            "storage",
            handleStorage
        );

        return () => {
            window.removeEventListener(
                "storage",
                handleStorage
            );
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: Boolean(token && user),
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
