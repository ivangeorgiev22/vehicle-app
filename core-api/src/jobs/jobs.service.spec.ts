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
    getJobsTable: jest.fn().mockReturnValue('jobs-test')
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

  describe('createJob()', () => {
    it('Should create a job for each mission type', async () => {
      mockDb.send.mockResolvedValue({});

      await service.createJob('1', 'Cleaning');
      expect(mockDb.send).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();

      await service.createJob('2', 'Fly Doctor');
      expect(mockDb.send).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();

      await service.createJob('3', 'Maintenance');
      expect(mockDb.send).toHaveBeenCalledTimes(1);
    });

    it('Should serialize tasks as JSON before inserting', async () => {
      mockDb.send.mockResolvedValue({});
      await service.createJob('1', 'Cleaning');
    
      const args = mockDb.send.mock.calls[0][0];
      const tasks = args.input.Item.tasks;

      expect(typeof tasks).toBe('string');
      expect(() => JSON.parse(tasks)).not.toThrow();
    });
  });

  describe('updateJobStatus()', () => {
    it('Should update job status', async () => {
      const mockJob = {
        id: '1',
        mission_id: '1',
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
          job_title: 'Exterior Clean',
          job_status: 'Backlog',
          tasks: JSON.stringify([{key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}])
        },
        {
          id: '2',
          mission_id: '1',
          job_title: 'Interior Clean',
          job_status: 'Backlog',
          tasks: JSON.stringify([{key: 'clean-2', description: 'Clean interior', task_status: 'Waiting'}])
        }
      ];
      mockDb.send.mockResolvedValue({Items: mockJobs});
      const res = await service.backlogJobs();
      expect(res).toHaveLength(2);
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
 