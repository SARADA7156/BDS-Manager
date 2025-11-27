import { create } from 'zustand';
import type { JobInfo } from '../../../shared/types/job';

interface JobState {
    jobs: JobInfo[];
    setJobs: (newJobs: JobInfo[]) => void;
    addJob: (job: JobInfo) => void
    updateJob: (jobId: JobInfo['jobId'], newState: JobInfo['state']) => void;
    deleteJob: (deleteId: JobInfo['jobId']) => void;
    handleCompletion: (jobId: JobInfo['jobId'], newState: JobInfo['state']) => void;
}

export const useJobStore = create<JobState>((set) => ({
    jobs: [],

    setJobs: (newJobs) => set(() => ({
        jobs: newJobs
    })),

    addJob: (job) =>
        set((state) => {
            const exists = state.jobs.some(j => j.jobId === job.jobId);
            return exists
                ? state
                : { jobs: [...state.jobs, job] };
    }),

    updateJob: (targetId, newState) => set((state) => ({
        jobs: state.jobs.map(job => {
            if (job.jobId === targetId) {
                return {
                    ...job,
                    state: newState,
                };
            }
            return job;
        })
    })),

    deleteJob: (deleteId) => set((state) => ({
        jobs: state.jobs.filter(job => job.jobId !== deleteId),
    })),

    handleCompletion: (jobId, newState) => {
        set((state) => ({
            jobs: state.jobs.map(job => 
                job.jobId === jobId ? { ...job, state: newState} : job
            ),

        }))
        setTimeout(() => {
            useJobStore.getState().deleteJob(jobId)
        }, 1500);
    }
}));