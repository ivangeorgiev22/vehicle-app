import { TestingModule, Test } from "@nestjs/testing";
import { VehiclesService } from "./vehicles.service";
import { DynamoDBService } from "../database/dynamodb.service";

describe('VehiclesService', () => {
  let service: VehiclesService;

  const mockDb = {
    send: jest.fn()
  };

  const mockDbService = {
    getDb: jest.fn().mockReturnValue(mockDb),
    getVehiclesTable: jest.fn().mockReturnValue('vehicles-test')
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: DynamoDBService,
          useValue: mockDbService
        }
      ]
    }).compile();
    service = module.get<VehiclesService>(VehiclesService)
  });

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create()', () => {
    it('Creates a vehicle', async () => {
      mockDb.send.mockResolvedValue({});
      const res = await service.create({plate: 'ABC-123', battery: 80});

      expect(mockDb.send).toHaveBeenCalledTimes(1);
      expect(res.plate).toBe('ABC-123');
      expect(res.battery).toBe(80);
      expect(res.vehicle_status).toBe('Available');
      expect(res.vehicleId).toBeDefined();
    })
  });

  describe('findAll()', () => {
    it('Returns all saved vehicles', async () => {
      const mockVehicles = [
        {vehicleId: 'vehicle-1', plate: 'ABC-123', battery: 80, vehicle_status: 'Available'},
        {vehicleId: 'vehicle-2', plate: 'ABC-223', battery: 70, vehicle_status: 'Available'}
      ];
      mockDb.send.mockResolvedValue({Items: mockVehicles});
      const res = await service.findAll();

      expect(res).toHaveLength(2);
      expect(res[0].plate).toBe('ABC-123');
      expect(res[1].plate).toBe('ABC-223');
    })
  });

  describe('updateStatus()', () => {
    it('Updates vehicle status', async () => {
      const mockVehicle = {
        vehicleId: 'vehicle-1',
        plate: 'ABC-123',
        battery: 66,
        vehicle_status: 'Available'
      };

      mockDb.send
      .mockResolvedValueOnce({Item: mockVehicle})
      .mockResolvedValueOnce({});

      const res = await service.updateStatus('vehicle-1', {vehicle_status: 'Unavailable'});

      expect(mockDb.send).toHaveBeenCalledTimes(2);
      expect(res?.vehicle_status).toBe('Unavailable');
      expect(res?.plate).toBe('ABC-123');
    })
  })
})