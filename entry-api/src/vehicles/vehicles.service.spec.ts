import { TestingModule, Test } from "@nestjs/testing";
import { VehiclesService } from "./vehicles.service";
import { ApiClient } from "../core-client/api-client";

describe('VehiclesService', () => {
  let service: VehiclesService;

  const mockApiClient = {
    createVehicle: jest.fn(),
    getVehicles: jest.fn(),
    updateVehicleStatus: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: ApiClient,
          useValue: mockApiClient
        }
      ]
    }).compile()
    service = module.get<VehiclesService>(VehiclesService)
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('Calls API with plate and battery and returns created vehicle', async () => {
      const mockVehicle = {
        vehicleId: 'vehicle-1',
        plate: 'ABC-123',
        battery: 80,
        vehicle_status: 'Available'
      }
      mockApiClient.createVehicle.mockResolvedValue(mockVehicle);
      const res = await service.create({plate: 'ABC-123', battery: 80});

      expect(mockApiClient.createVehicle).toHaveBeenCalledWith('ABC-123', 80);
      expect(res).toEqual(mockVehicle);
    });
  });

  describe('getAll()', () => {
    it('Returns all vehicles', async () => {
      const mockVehicles = [
        {vehicleId: 'vehicle-id', plate: 'ABC-123', battery: 100, vehicle_status: 'Available'},
        {vehicleId: 'vehicle-id', plate: 'ABC-123', battery: 100, vehicle_status: 'Available'}
      ];
      mockApiClient.getVehicles.mockResolvedValue(mockVehicles);

      const res = await service.getAll();

      expect(mockApiClient.getVehicles).toHaveBeenCalledTimes(1);
      expect(res).toHaveLength(2);
    });
  });

  describe('updateStatus()', () => {
    it('Calls API with vehicleId and status', async () => {
      const mockVehicle = {
        vehicleId: 'vehicle-1',
        plate: 'ABC-123',
        battery: 80,
        vehicle_status: 'Unavailable'
      };
      mockApiClient.updateVehicleStatus.mockResolvedValue(mockVehicle);

      const res = await service.updateStatus('vehicle-1', {vehicle_status: 'Unavailable'});

      expect(mockApiClient.updateVehicleStatus).toHaveBeenCalledWith('vehicle-1', 'Unavailable');
      expect(res.vehicle_status).toBe('Unavailable');
    });
  });
});