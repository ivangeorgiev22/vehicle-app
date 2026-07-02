export interface Task {
  key: string;
  description: string;
  taskStatus: 'Waiting' | 'Accepted' | 'Completed'
}

export interface JobTemplate {
  jobTitle: string;
  tasks: Task[];
}

export interface Vehicle {
  plate: string;
}

export interface Job {
  id: string;
  missionId: string;
  vehicle: Vehicle;
  jobTitle: string;
  jobStatus: string;
  tasks: Task[];
}