export interface CreateMissionRequest {
  type: 'Cleaning' | 'Fly Doctor' | 'Maintenance';
  vehicleId: string;
}