export interface Job {
  id: string;
  missionId: string;
  vehicle: Vehicle;
  jobTitle: string;
  jobTtatus: string;
  tasks: Task[];
}

export interface Task {
  key: string;
  description: string;
  taskStatus: 'Waiting' | 'Accepted' | 'Completed'
}

export interface Vehicle {
  plate: string;
}