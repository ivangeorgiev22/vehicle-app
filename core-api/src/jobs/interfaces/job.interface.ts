export interface Task {
  key: string;
  description: string;
  task_status: 'Waiting' | 'Accepted' | 'Completed'
}

export interface JobTemplate {
  job_title: string;
  tasks: Task[];
}