export interface Vehicle {
  id: string;
  plate: string;
  battery: number;
  vehicleStatus: 'Available' | 'Unavailable'
}