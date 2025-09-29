import './homePage.css';

const HomePage = () => {
    return (
        <header>
            <div className='p-2 d-grid align-items-center header-content'>
                <div className="row align-items-center">
                    <div id="serviceName" className="d-flex align-items-center col-11">
                        <img src="../../../public/imgs/bedrock_icon.webp" alt="BDS Manager Icon" className="bedrock" />
                        <h1 className="mb-0 ms-3"><b>BDS</b> Manager</h1>
                    </div>

                    <div className="col-1">
                        <a href="/login" id="signin" className="btn box-border">サインイン</a>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default HomePage;