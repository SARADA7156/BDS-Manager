import type { JobInfo } from "./job";

type JobUpdate = {
    jobId: JobInfo['jobId'];
    newState: JobInfo['state'];
}