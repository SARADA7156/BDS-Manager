const Footer = () => {
    return (
        <footer className="container-fluid justify-content-center d-grid">
            <div className="d-grid justify-content-center align-items-center information">
                <div className="d-flex justify-content-center BDS-emblem">
                    <img src="../../../public/imgs/bedrock_icon.webp" alt="BDS Manager icon" className="bedrock"/>
                    <h2 className="ms-2"><b>BDS</b> Manager</h2>
                </div>

                <p className="text-center">当Webアプリケーションは<code>SARADA7156</code>が管理・運営している個人用Webアプリケーションです。<br></br>管理者の許可なく不正にログイン・操作することは一切禁じます。</p>
            </div>

            <small className="text-center text-white-50">&copy;2025 SARADA7156</small>
        </footer>
    )
}

export default Footer;