
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
    const successMessage = location.state?.message;
    const from = location.state?.from?.pathname || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", {
                email: email.trim(),
                password,
            });

            // Spring Boot trả JWT dạng text/plain
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
                    <div className="uv-brand-logo">
                        <ShoppingBag size={23} strokeWidth={2.3} />
                        <span>
              UV<strong>Mart.</strong>
            </span>
                    </div>

                    <div className="uv-brand-content">
                        <div className="uv-brand-eyebrow">
                            <Sparkles size={15} />
                            YOUR EVERYDAY MARKETPLACE
                        </div>

                        <h1>
                            Mọi lựa chọn.
                            <br />
                            <span>Một điểm đến.</span>
                        </h1>

                        <p>
                            Khám phá những sản phẩm phù hợp với bạn.
                            Trải nghiệm mua sắm đơn giản, tiện lợi
                            và đầy cảm hứng.
                        </p>

                        <div className="uv-brand-feature">
                            <ShieldCheck size={19} />
                            <span>Mua sắm thuận tiện mỗi ngày</span>
                        </div>
                    </div>

                    <div className="uv-brand-bottom">
                        <span>UVMART / EST. 2026</span>
                        <span>DISCOVER MORE</span>
                    </div>

                    <div className="uv-brand-circle uv-circle-one" />
                    <div className="uv-brand-circle uv-circle-two" />
                </section>

                <section className="uv-login-panel">
                    <div className="uv-login-top">
                        <Link to="/" className="uv-back-home">
                            ← Quay về cửa hàng
                        </Link>
                    </div>

                    <div className="uv-login-content">
                        <div className="uv-login-heading">
              <span className="uv-login-kicker">
                WELCOME BACK
              </span>

                            <h2>Chào mừng trở lại<span>.</span></h2>

                            <p>
                                Đăng nhập để tiếp tục hành trình mua sắm
                                cùng UVMart.
                            </p>
                        </div>

                        {successMessage && (
                            <div className="uv-login-success" role="status">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="uv-login-error" role="alert">
                                    {error}
                                </div>
                            )}

                            <div className="uv-field">
                                <label htmlFor="login-email">
                                    Địa chỉ email
                                </label>

                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu của bạn"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="uv-toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
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
                <span>
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </span>
                                <ArrowRight size={19} />
                            </button>
                        </form>

                        <div className="uv-login-register">
                            Chưa có tài khoản?{" "}
                            <Link to="/register">Đăng ký ngay</Link>
                        </div>
                    </div>

                    <div className="uv-login-footer">
                        © 2026 UVMart. Designed for better shopping.
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Login;
