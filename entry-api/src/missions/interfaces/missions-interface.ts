import { Job } from "../../jobs/interfaces/job-interface";

export interface Mission {
  id: number;
  mission_type: 'Cleaning' | 'Fly Doctor' | 'Maintenance';
  mission_status: 'Created' | 'In progress' | 'Completed' | 'Cancelled'
}

export interface MissionWithJobs extends Mission {
  jobs: Job[];
}