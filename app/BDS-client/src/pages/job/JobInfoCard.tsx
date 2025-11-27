import type React from "react";
import type { JobInfo } from "../../../../shared/types/job"
import { formatIsoData } from "../../utils/format/formatIsoDate";

interface JobCardProps {
    job: JobInfo;
}

export const JobInfoCard = ({ job }: JobCardProps) => {
    function handleState(state: JobInfo['state']): React.ReactNode {
        const jobStateToLabel = {
            "completed": "完了",
            "failed": "失敗",
            "active": "実行中",
            "delayed": "遅延中",
            "prioritized": "優先実行中",
            "waiting": "待機中",
            "waiting-children": "子ジョブ待機中",
            "unknown": "不明",
        } as const;

        const jobStateToIcon = {
            "completed": "task_alt",
            "failed": "close",
            "active": "play_circle",
            "delayed": "schedule",
            "prioritized": "arrow_shape_up_stack",
            "waiting": "hourglass",
            "waiting-children": "autopause",
            "unknown": "error",
        } as const;

        const label = jobStateToLabel[state] || "不明";
        const icon = jobStateToIcon[state] || 'help';

        return (
            <>
                <span className="material-symbols-outlined">{icon}</span>
                <p>{label}</p>
            </>
        );
    }

    const jobTypeToTitle = {
        "start": "サーバー起動",
        "stop": "サーバー停止",
        "restart": "サーバー再起動",
        "command": "コマンド送信",
        "create": "サーバーインスタンス作成",
    } as const;

    const title = jobTypeToTitle[job.type] || "不明なジョブ";

    return title ? (
        <div className={`job-card border-bottom job-state-${job.state}`}>
            <div className="d-grid">
                <h5 className="job-title">{title}</h5>
                <div className="d-flex job-info">
                    <p>対象インスタンス: {job.instanceName}</p>
                    <p className="ms-3">キュー追加日時: {formatIsoData(job.createdAt)}</p>
                </div>
            </div>
            <div className={`job-state ${job.state}`}>
                {handleState(job.state)}
            </div>
        </div>
    ) : null;
}