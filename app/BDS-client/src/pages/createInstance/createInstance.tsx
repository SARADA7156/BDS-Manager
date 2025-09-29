import './createInstance.css';

const Create = () => {
    return (
        <div className="col-11 p-3 content">
            <h2 id="page-title">サーバーインスタンスを追加</h2>
            <form className="p-2 rounded" id="createInstanceForm">
                <button className="btn box-border" id="create-btn">確認及び作成</button>
                <h3 className="mt-2 border-bottom">設定</h3>
                <div className="d-grid" id="settings-container"></div>
            </form>
        </div>
    )
}

export default Create;