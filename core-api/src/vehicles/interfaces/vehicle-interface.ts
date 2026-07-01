export interface Vehicle {
  vehicleId: string;
  plate: string;
  battery: number;
  vehicle_status: 'Available' | 'Unavailable'
}