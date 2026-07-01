export interface Vehicle {
  id: string;
  plate: string;
  battery: number;
  vehicle_status: 'Available' | 'Unavailable'
}