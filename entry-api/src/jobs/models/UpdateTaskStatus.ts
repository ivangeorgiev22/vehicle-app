export interface Task {
  key: string;
  description: string;
  taskStatus: 'Waiting' | 'Accepted' | 'Completed'
}