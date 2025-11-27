import { useState } from 'react';
import './job.css';
import { JobQueueState } from './JobQueueState';
import { JobQueueHistory } from './JobQueueHistory';

export const JobQueueList = () => {
    const [activeTab, setActiveTab] = useState<'state' | 'history'>('state');

    return(
        <div className="col-11 p-3 content">
            <h2 id="page-title">ジョブキュー管理</h2>


            <div className='bg-dark2 border' id='queue-info-container'>
                <ul className='list-unstyled m-0' id='queue-info-tab'>
                    <li
                        className={activeTab === 'state' ? 'active' : ''}
                        onClick={() => setActiveTab('state')}
                    >
                        <p>キュー状況</p>
                    </li>

                    <li
                        className={activeTab === 'history' ? 'active' : ''}
                        onClick={() => setActiveTab('history')}
                    >
                        <p>キュー履歴</p>
                    </li>
                </ul>

                {activeTab === 'state' && <JobQueueState />}

                {activeTab === 'history' && <JobQueueHistory />}
            </div>
        </div>
    )
}