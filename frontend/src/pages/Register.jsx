import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import api from "../services/api";
import "./Login.css";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");

        if (!form.name.trim()) {
            setError("Vui lòng nhập họ và tên.");
            return;
        }

        if (form.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/users", {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            navigate("/login", {
                replace: true,
                state: {
                    message: "Đăng ký thành công. Vui lòng đăng nhập.",
                },
            });

        } catch (err) {
            const status = err.response?.status;

            if (status === 409) {
                setError("Email này đã được sử dụng.");
            } else if (status === 400) {
                setError(
                    err.response?.data?.message ||
                    "Thông tin đăng ký không hợp lệ."
                );
            } else {
                setError("Không thể tạo tài khoản. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="uv-login uv-register">
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
                            <h1>Đăng ký</h1>

                            <p>
                                Tạo tài khoản để mua hàng và
                                theo dõi đơn hàng tại UVMart.
                            </p>
                        </div>

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
                                <label htmlFor="register-name">
                                    Họ và tên
                                </label>

                                <input
                                    id="register-name"
                                    name="name"
                                    type="text"
                                    placeholder="Nhập họ và tên"
                                    value={form.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="uv-field">
                                <label htmlFor="register-email">
                                    Email
                                </label>

                                <input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    placeholder="Nhập địa chỉ email"
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="uv-field">
                                <label htmlFor="register-password">
                                    Mật khẩu
                                </label>

                                <div className="uv-password-wrap">
                                    <input
                                        id="register-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Tối thiểu 6 ký tự"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="uv-toggle-password"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
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

                            <div className="uv-field">
                                <label htmlFor="register-confirm">
                                    Xác nhận mật khẩu
                                </label>

                                <input
                                    id="register-confirm"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập lại mật khẩu"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="uv-login-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Đang đăng ký..."
                                    : "Đăng ký"}
                            </button>
                        </form>

                        <div className="uv-login-register">
                            Đã có tài khoản?{" "}
                            <Link to="/login">Đăng nhập</Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Register;