import { Router } from "express";
import { logger } from "../../../../services/log/logger";
import { JobInfo } from "@shared/types/job";

const router = Router();

router.post('/jobList', async (req, res) => {
    try {
        const jobs: JobInfo[] = await req.services.obsidianCore.getJobs();

        // const jobs: JobInfo[] = [
        //     {type: 'start', jobId: '00001', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'active'},
        //     {type: 'stop', jobId: '00002', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'waiting'},
        //     {type: 'restart', jobId: '00003', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'failed'},
        //     {type: 'start', jobId: '00004', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'completed'},
        //     {type: 'start', jobId: '00005', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'delayed'},
        //     {type: 'start', jobId: '00006', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'prioritized'},
        //     {type: 'start', jobId: '00007', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'waiting-children'},
        //     {type: 'start', jobId: '00008', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'unknown'},
        //     {type: 'start', jobId: '00009', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'waiting'},
        //     {type: 'start', jobId: '00009', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'waiting'},
        //     {type: 'start', jobId: '00009', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'waiting'},
        //     {type: 'start', jobId: '00009', instanceName: 'test-instance', executedBy: 'shou', executorType: 'user', createdAt: new Date(), state: 'waiting'},
        // ]

        res.status(200).json({ jobs });
    } catch(err) {
        const errorDetail = (err instanceof Error) ? err.message : String(err);
        logger.error(`ジョブリストの取得に失敗しました。 詳細: ${errorDetail}`);
        res.status(500).json({ status: 500, code: "internal_server_error", message: "ジョブリストの取得に失敗しました。" })
    }
});

export default router;