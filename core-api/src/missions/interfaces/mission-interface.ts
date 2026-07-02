import { Job } from "../../jobs/interfaces/job.interface";

export interface Mission {
  id: string;
  missionType: 'Cleaning' | 'Fly Doctor' | 'Maintenance';
  missionStatus: 'Created' | 'In progress' | 'Completed' | 'Cancelled',
  vehicleId: string;
}

export interface MissionWithJobs extends Mission {
  jobs: Job[];
}