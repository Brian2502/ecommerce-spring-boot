
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    ShoppingBag,
    ShieldCheck,
    Sparkles,
    Check,
} from "lucide-react";

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
                    message: "Tạo tài khoản thành công! Hãy đăng nhập.",
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
                    <Link to="/" className="uv-brand-logo">
                        <ShoppingBag size={23} />
                        <span>
              UV<strong>Mart.</strong>
            </span>
                    </Link>

                    <div className="uv-brand-content">
                        <div className="uv-brand-eyebrow">
                            <Sparkles size={15} />
                            JOIN THE UVMART COMMUNITY
                        </div>

                        <h1>
                            Bắt đầu hành trình.
                            <br />
                            <span>Khám phá nhiều hơn.</span>
                        </h1>

                        <p>
                            Một tài khoản, nhiều trải nghiệm.
                            Khám phá sản phẩm, quản lý giỏ hàng
                            và theo dõi đơn hàng của bạn.
                        </p>

                        <div className="uv-register-benefits">
                            <div>
                                <Check size={17} />
                                <span>Khám phá sản phẩm dễ dàng</span>
                            </div>
                            <div>
                                <Check size={17} />
                                <span>Quản lý giỏ hàng cá nhân</span>
                            </div>
                            <div>
                                <ShieldCheck size={17} />
                                <span>Quản lý tài khoản thuận tiện</span>
                            </div>
                        </div>
                    </div>

                    <div className="uv-brand-bottom">
                        <span>UVMART / EST. 2026</span>
                        <span>MADE FOR YOUR EVERYDAY</span>
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
                CREATE YOUR ACCOUNT
              </span>

                            <h2>
                                Tham gia UVMart<span>.</span>
                            </h2>

                            <p>
                                Tạo tài khoản miễn phí để bắt đầu
                                trải nghiệm mua sắm của riêng bạn.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="uv-login-error" role="alert">
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
                                    placeholder="Nguyễn Văn A"
                                    value={form.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="uv-field">
                                <label htmlFor="register-email">
                                    Địa chỉ email
                                </label>
                                <input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
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

                            <div className="uv-field">
                                <label htmlFor="register-confirm">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="register-confirm"
                                    name="confirmPassword"
                                    type="password"
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
                <span>
                  {loading
                      ? "Đang tạo tài khoản..."
                      : "Tạo tài khoản"}
                </span>
                                <ArrowRight size={19} />
                            </button>
                        </form>

                        <div className="uv-login-register">
                            Đã có tài khoản?{" "}
                            <Link to="/login">Đăng nhập ngay</Link>
                        </div>
                    </div>

                    <div className="uv-login-footer">
                        © 2026 UVMart. Your everyday marketplace.
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Register;
