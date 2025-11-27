import { Link } from "react-router-dom";
import './job.css';

export const JobLayout = () => {
    return (
        <div className="col-11 p-3 content">
            <h2 id="page-title">ジョブの管理</h2>

            <ul className="list-unstyled bg-dark2 p-2 border" id="job-func-list">
                <li className="border-bottom">
                    <Link to="queue" className="p-2" title="ジョブキュー管理">
                        <span className="material-symbols-outlined">lists</span>
                        <p className="job-func-item">ジョブキュー管理</p>
                    </Link>
                </li>
                <li className="border-bottom">
                    <Link to="addJob" className="p-2" title="ジョブを追加">
                        <span className="material-symbols-outlined">add_circle</span>
                        <p className="job-func-item">ジョブを追加</p>
                    </Link>
                </li>
            </ul>
        </div>
    )
}