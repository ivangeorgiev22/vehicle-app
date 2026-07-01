export interface CreateMissionRequest {
  mission_type: 'Cleaning' | 'Fly Doctor' | 'Maintenance';
  vehicle_id: string;
}