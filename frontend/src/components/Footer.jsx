import "./Footer.css";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h2>
                        UV<span>Mart</span>
                    </h2>
                    <p>
                        Khám phá công nghệ hiện đại.
                        Mua sắm dễ dàng mỗi ngày.
                    </p>
                </div>

                <div>
                    <h3>Khám phá</h3>
                    <a href="/#products">Sản phẩm</a>
                    <a href="/#categories">Danh mục</a>
                </div>

                <div>
                    <h3>Tài khoản</h3>
                    <a href="/login">Đăng nhập</a>
                    <a href="/orders">Đơn hàng</a>
                </div>

                <div>
                    <h3>UVMart</h3>
                    <p>Website E-commerce Demo</p>
                    <p>Spring Boot + React</p>
                </div>
            </div>

            <div className="footer-bottom">
                © 2026 UVMart. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;