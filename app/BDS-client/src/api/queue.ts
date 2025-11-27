import type { JobInfo } from "../../../shared/types/job";
import axiosClient from "./axiosClient";

export async function getJobQueueList(): Promise<JobInfo[]> {
    try {
        const response = await axiosClient.post('/queue/jobList');
        return response.data.jobs;
    } catch(err) {
        throw err;
    }
}