import type { Socket } from "socket.io-client";
import type { JobUpdate } from "../../../shared/types/socketEvents";
import { useJobStore } from "../store/jobStore"

export const setupSocketListeners = (socket: Socket) => {
    socket.on('job_update', (data: JobUpdate) => {
        if (data.newState === 'completed') {
            useJobStore.getState().handleCompletion(data.jobId, data.newState);
        } else {
            useJobStore.getState().updateJob(data.jobId, data.newState);
        }
    });
}