import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { getJobQueueList } from "../../api/queue";
import Loader from "../../components/loader/Loader";
import { JobInfoCard } from "./JobInfoCard";
import { useJobStore } from "../../store/jobStore";

export const JobQueueState = () => {
    const {loading, isAuthenticated} = useAuth();
    const [loaderActive, setLoaderActive] = useState(false);
    const [error, setError] = useState(false);
    const jobs = useJobStore(state => state.jobs);
    const setJobs = useJobStore(state => state.setJobs);

    const executeFetch = useCallback(async () => {
        setLoaderActive(true);
        try {
            const data = await getJobQueueList();
            if (data) {
                setJobs(data);
            }
        } catch(err) {
            console.error('キュー状態の取得に失敗しました: ', err);
            setError(true);
        } finally {
            setLoaderActive(false);
        }
    }, [setJobs, setError]);

    useEffect(() => {
        if (!loading && isAuthenticated) {
            executeFetch();
        }
    }, [isAuthenticated, loading, executeFetch]);

    return (
        <div className="queue-list-container">
            <div className="border-bottom m-2 d-flex align-items-center">
                <h3>キュー状況</h3>
                <button className="btn ms-auto m-1" onClick={() => executeFetch()}>更新</button>
            </div>

            {loaderActive && <Loader />}

            {!loaderActive && (
                <>
                    {!error && jobs.length <= 0 && <p className="text-center">現在キューにはジョブがありません。</p>}

                    {!error && jobs.length >= 0 && (
                        <ul id="job-list" className="list-unstyled m-2 custom-scrollbar">
                            {jobs.map((job) => (
                                <li key={job.jobId}>
                                    <JobInfoCard job={job}/>
                                </li>
                            ))}
                        </ul>
                    )}

                    {error && (
                        <div className="d-grid text-center">
                            <p className="text-center">キュー状態の取得に失敗しました。</p>
                            <button className="m-auto w-25" onClick={() => executeFetch()}>再取得</button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}