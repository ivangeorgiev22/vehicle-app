import { TestingModule, Test } from "@nestjs/testing";
import { MissionsService } from "./missions.service";
import { DynamoDBService } from "../database/dynamodb.service";
import { JobsService } from "../jobs/jobs.service";

describe('MissionsService', () => {
  let service: MissionsService;

 const mockDb = {
  send: jest.fn()
 };
 const mockDbService = {
  getDb: jest.fn().mockReturnValue(mockDb),
  getMissionsTable: jest.fn().mockReturnValue('missions-test'),
  getJobsTable: jest.fn().mockReturnValue('jobs-test')
 };
 const mockJobsService = {
  createJob: jest.fn()
 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionsService,
        {
          provide: DynamoDBService,
          useValue: mockDbService
        },
        {
          provide: JobsService,
          useValue: mockJobsService
        }
      ]
    }).compile();
    service = module.get<MissionsService>(MissionsService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('Inserts a mission with correct type', async () => {
      mockDb.send.mockResolvedValue({});
      mockJobsService.createJob.mockResolvedValue(undefined);

      await service.create({mission_type: 'Cleaning'});
      expect(mockJobsService.createJob).toHaveBeenCalledWith(
        expect.any(String), // uuid
        'Cleaning'
      );
    });

    it('Calls jobsService with mission id and type', async () => {
      mockDb.send.mockResolvedValue({});
      mockJobsService.createJob.mockResolvedValue(undefined);

      await service.create({mission_type: 'Cleaning'});
      expect(mockJobsService.createJob).toHaveBeenCalledWith(expect.any(String), 'Cleaning');
    });

    it('Returns created mission', async () => {
      mockDb.send.mockResolvedValue({});
      mockJobsService.createJob.mockResolvedValue(undefined);

      const res = await service.create({mission_type: 'Cleaning'});
      expect(res?.mission_type).toBe('Cleaning');
      expect(res?.id).toBeDefined();
      expect(res?.mission_status).toBe('Created')
    });
  });

  describe('findOne()', () => {
    it('Returns mission with jobs and tasks', async () => {
      const mockMission = {
        id: '1',
        mission_type: 'Cleaning',
        mission_status: 'Created'
      };
      
      const mockJob = [
        {
          id: '1',
          mission_id: '1',
          job_title: 'Exterior Clean',
          job_status: 'Backlog',
          tasks: JSON.stringify([
            {key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}
          ])
        }
      ];

      mockDb.send.mockResolvedValueOnce({Item: mockMission});
      mockDb.send.mockResolvedValueOnce({Items: mockJob});

      const res = await service.findOne('1');
      expect(res).toEqual({
        id: '1',
        mission_type: 'Cleaning',
        mission_status: 'Created',
        jobs: [
          {
            id: '1',
            mission_id: '1',
            job_title: 'Exterior Clean',
            job_status: 'Backlog',
            tasks: [
              {key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}
            ]
          }
        ]
      });
    });
  });

  describe('updateStatus()', () => {
    it('Updates mission status', async () => {
      const mockMission = {
        id: '1',
        mission_type: 'Cleaning',
        mission_status: 'Created'
      };

      mockDb.send
      .mockResolvedValueOnce({Item: mockMission})
      .mockResolvedValueOnce({});

      const res = await service.updateStatus('1', {mission_status: 'In progress'});
      expect(mockDb.send).toHaveBeenCalledTimes(2);
      expect(res).toEqual({...mockMission});
    })
  })
});