import './createInstance.css';
import InstanceSetting from '../../components/InstansSetting/InstanceSetting';

const Create = () => {
    return (
        <div className="col-11 p-3 content">
            <h2 id="page-title">サーバーインスタンスを追加</h2>
            <div className="p-2 rounded" id="createInstanceForm">
                <h3 className="mt-2 border-bottom">設定</h3>
                <InstanceSetting/>
            </div>
        </div>
    )
}

export default Create;