export interface Task {
  key: string;
  description: string;
  task_status: 'Waiting' | 'Accepted' | 'Completed'
}

export interface JobTemplate {
  job_title: string;
  tasks: Task[];
}

export interface Job {
  id: string;
  mission_id: number;
  vehicle_id?: string;
  plate?: string;
  job_title: string;
  job_status: string;
  tasks: Task[];
}