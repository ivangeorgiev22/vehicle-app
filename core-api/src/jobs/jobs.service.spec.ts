import { TestingModule, Test, } from "@nestjs/testing";
import { JobsService } from "./jobs.service";
import { DynamoDBService } from "../database/dynamodb.service";

describe.only('JobsService', () => {
  let service: JobsService;

  const mockDb = {
    send: jest.fn()
  };

  const mockDbService = {
    getDb: jest.fn().mockReturnValue(mockDb),
    getJobsTable: jest.fn().mockReturnValue('jobs-test'),
    getVehiclesTable: jest.fn().mockReturnValue('vehicles-test')
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: DynamoDBService,
          useValue: mockDbService
        }
      ]
    }).compile();
    service = module.get<JobsService>(JobsService);
  })
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateJobStatus()', () => {
    
    it('Should update job status', async () => {
      const mockJob = {
        id: '1',
        mission_id: '1',
        vehicle_id: 'vehicle-1',
        job_title: 'Exterior Clean',
        job_status: 'Backlog',
        tasks: '[]'
      };
      mockDb.send
      .mockResolvedValueOnce({Item: mockJob}) //get command
      .mockResolvedValueOnce({}) // update command

      const res = await service.updateJobStatus('1', {job_status: 'Accepted'});
      expect(res).toEqual({...mockJob});
    });
  });

  describe('updateTaskStatus()', () => {
    it('Updates task status and returns job with parsed tasks', async () => {
      const mockJob = {
        id: '1',
        mission_id: '1',
        job_title: 'Exterior Clean',
        job_status: 'Backlog',
        tasks: JSON.stringify([
          {key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}
        ])
      };

      mockDb.send
      .mockResolvedValueOnce({Item: mockJob})
      .mockResolvedValueOnce({});

      const res = await service.updateTaskStatus('1', 'clean-1', 'Accepted');
      expect(res).toEqual({
        id: '1',
        mission_id: '1',
        job_title: 'Exterior Clean',
        job_status: 'Backlog',
        tasks: [
          {key: 'clean-1', description: 'Wash vehicle', task_status: 'Accepted'}
        ]
      });
    });
  });
  describe('backlogJobs()', () => {
    it('Returns all jobs with Backlog status', async () => {
      const mockJobs = [
        {
          id: '1',
          mission_id: '1',
          vehicle_id: 'vehicle-1',
          job_title: 'Exterior Clean',
          job_status: 'Backlog',
          tasks: JSON.stringify([{key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}])
        },
        {
          id: '2',
          mission_id: '1',
          vehicle_id: 'vehicle-2',
          job_title: 'Interior Clean',
          job_status: 'Backlog',
          tasks: JSON.stringify([{key: 'clean-2', description: 'Clean interior', task_status: 'Waiting'}])
        }
      ];
      mockDb.send.mockResolvedValueOnce({Items: mockJobs});
      mockDb.send.mockResolvedValueOnce({Item: {vehicleId: 'vehicle-1', plate: 'ABC-123'}});
      mockDb.send.mockResolvedValueOnce({Item: {vehicleId: 'vehicle-1', plate: 'ABC-123'}});
      const res = await service.backlogJobs();
      expect(res).toHaveLength(2);
      expect(res[0].plate).toBe('ABC-123');
      expect(res[1].plate).toBe('ABC-123');
    });
  });

  describe('getJobById()', () => {
    it('Returns job with parsed tasks', async () => {
      mockDb.send.mockResolvedValue({
        Item: {
          id: '1',
          mission_id: '1',
          job_title: 'Exterior clean',
          job_status: 'Backlog',
          tasks: JSON.stringify([
            {key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}
          ])
        }
      });
      const res = await service.getJobById('1');
      expect(res).toEqual({
        id: '1',
        mission_id: '1',
        job_title: 'Exterior clean',
        job_status: 'Backlog',
        tasks: [
          {key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}
        ]
      });
    });
  });
});
 