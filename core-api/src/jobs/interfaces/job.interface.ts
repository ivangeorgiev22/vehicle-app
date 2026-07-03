export interface Task {
  key: string;
  description: string;
  taskStatus: 'Waiting' | 'Accepted' | 'Completed'
}

export interface Vehicle {
  plate: string;
}

export interface Job {
  id: string;
  missionId: string;
  vehicle: Vehicle;
  title: string;
  jobStatus: string;
  tasks: Task[];
}