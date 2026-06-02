export interface Task {
  key: string;
  description: string;
  task_status: 'Waiting' | 'Accepted' | 'Completed'
}