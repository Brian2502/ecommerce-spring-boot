import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo-link">
                        <img
                            src="/images/logo.png"
                            alt="UVMart"
                            className="footer-logo"
                        />
                    </Link>

                    <p>
                        Cửa hàng điện thoại, laptop, thiết bị
                        công nghệ và phụ kiện.
                    </p>
                </div>

                <div>
                    <h3>Mua sắm</h3>
                    <Link to="/">Trang chủ</Link>
                    <Link to="/#products">Tất cả sản phẩm</Link>
                </div>

                <div>
                    <h3>Tài khoản</h3>
                    <Link to="/login">Đăng nhập</Link>
                    <Link to="/cart">Giỏ hàng</Link>
                    <Link to="/orders">Đơn hàng của tôi</Link>
                </div>

                <div>
                    <h3>Về UVMart</h3>
                    <p>Thành phố Hồ Chí Minh, Việt Nam</p>
                    <p>Dự án thương mại điện tử</p>
                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} UVMart.
                Bảo lưu mọi quyền.
            </div>
        </footer>
    );
}

export default Footer;