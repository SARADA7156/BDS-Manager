import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { getJobQueueList } from "../../api/queue";
import type { JobInfo } from '../../../../shared/types/job';
import Loader from "../../components/loader/Loader";
import { JobInfoCard } from "./JobInfoCard";

export const JobQueueState = () => {
    const {loading, isAuthenticated} = useAuth();
    const [loaderActive, setLoaderActive] = useState(false);
    const [jobList, setJobList] = useState<JobInfo[] | null>([]);

    async function fetchJobs(): Promise<void> {
        // データ取得が完了したらローダーを解除
        try {
            const data = await getJobQueueList();
            if (data && data.length >= 0) {
                setJobList(data);
            } else {
                setJobList(null);
            }
        } catch (error) {
            console.error("キュー状態の取得に失敗しました:", error);
            setJobList(null); // エラー時もリストを null に
        }
    }

    useEffect(() => {
        if (loading || !isAuthenticated) {
            setLoaderActive(false); // 認証中はローダーを停止
            return;
        }

        const timer = setTimeout(() => {
            setLoaderActive(true);
        }, 500);

        fetchJobs();

        setLoaderActive(false);
        clearTimeout(timer);

        return () => clearTimeout(timer);
    }, [loading, isAuthenticated]);

    return (
        <div className="queue-list-container">
            <div className="border-bottom m-2 d-flex align-items-center">
                <h3>キュー状況</h3>
                <button className="btn ms-auto m-1" onClick={() => fetchJobs()}>更新</button>
            </div>

            {loaderActive && <Loader />}

            {!loaderActive && (
                <>
                    {jobList !== null && jobList.length <= 0 && <p className="text-center">現在キューにはジョブがありません。</p>}

                    {jobList !== null && jobList.length >= 0 && (
                        <ul id="job-list" className="list-unstyled m-2 custom-scrollbar">
                            {jobList.map((job) => (
                                <li key={job.jobId}>
                                    <JobInfoCard job={job}/>
                                </li>
                            ))}
                        </ul>
                    )}

                    {jobList === null && (
                        <div className="d-grid text-center">
                            <p className="text-center">キュー状態の取得に失敗しました。</p>
                            <button className="m-auto w-25" onClick={() => fetchJobs()}>再取得</button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}