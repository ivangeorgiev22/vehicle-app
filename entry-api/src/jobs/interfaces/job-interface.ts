export interface Job {
  id: number;
  mission_id: number;
  vehicle_id?: string;
  plate?: string;
  job_title: string;
  job_status: string;
  tasks: Task[];
}

export interface Task {
  key: string;
  description: string;
  task_status: 'Waiting' | 'Accepted' | 'Completed'
}