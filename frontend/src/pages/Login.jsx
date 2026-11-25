import { useState } from "react";
import {
    Link,
    useNavigate,
    useLocation,
} from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const successMessage = location.state?.message;
    const from = location.state?.from?.pathname || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", {
                email: email.trim(),
                password,
            });

            const jwt = response.data;

            if (
                typeof jwt !== "string" ||
                jwt.trim().split(".").length !== 3
            ) {
                throw new Error("Invalid JWT response");
            }

            login(jwt.trim());
            navigate(from, { replace: true });

        } catch (err) {
            if (err.response?.status === 401) {
                setError("Email hoặc mật khẩu không chính xác.");
            } else if (err.response?.status === 403) {
                setError("Không có quyền đăng nhập.");
            } else {
                setError("Đăng nhập thất bại. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="uv-login">
            <div className="uv-login-shell">

                <section className="uv-login-brand">
                    <div className="uv-brand-content">
                        <Link to="/" className="uv-brand-logo">
                            <img
                                src="/images/logo.png"
                                alt="UVMart"
                            />
                        </Link>

                        <h2>Cửa hàng công nghệ</h2>

                        <p>
                            Điện thoại, laptop và phụ kiện
                            tại UVMart.
                        </p>
                    </div>

                    <div className="uv-brand-bottom">
                        © {new Date().getFullYear()} UVMart
                    </div>
                </section>

                <section className="uv-login-panel">
                    <div className="uv-login-top">
                        <Link to="/" className="uv-back-home">
                            ← Quay về cửa hàng
                        </Link>
                    </div>

                    <div className="uv-login-content">
                        <div className="uv-login-heading">
                            <h1>Đăng nhập</h1>

                            <p>
                                Đăng nhập vào tài khoản UVMart
                                của bạn.
                            </p>
                        </div>

                        {successMessage && (
                            <div
                                className="uv-login-success"
                                role="status"
                            >
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div
                                    className="uv-login-error"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}

                            <div className="uv-field">
                                <label htmlFor="login-email">
                                    Email
                                </label>

                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="Nhập địa chỉ email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="uv-field">
                                <label htmlFor="login-password">
                                    Mật khẩu
                                </label>

                                <div className="uv-password-wrap">
                                    <input
                                        id="login-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Nhập mật khẩu"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        autoComplete="current-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="uv-toggle-password"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Ẩn mật khẩu"
                                                : "Hiện mật khẩu"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                className="uv-login-submit"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Đang đăng nhập..."
                                    : "Đăng nhập"}
                            </button>
                        </form>

                        <div className="uv-login-register">
                            Chưa có tài khoản?{" "}
                            <Link to="/register">Đăng ký</Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Login;