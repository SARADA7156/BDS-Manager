import { create } from 'zustand';
import type { JobInfo } from '../../../shared/types/job';

interface JobState {
    jobs: JobInfo[];
    updateJobState: (jobId: JobInfo['jobId'], newState: JobInfo['state']) => void;
}

export const useJobStore = create<JobState>((set) => ({
    jobs: [],

    updateJobState: (targetId, newState) => set((state) => ({
        jobs: state.jobs.map(job => {
            if (job.jobId === targetId) {
                return {
                    ...job,
                    state: newState,
                };
            }
            return job;
        })
    }))
}));