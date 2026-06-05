import { TestingModule, Test, } from "@nestjs/testing";
import { JobsService } from "./jobs.service";
import { DatabaseService } from "../database/database.service";

describe('JobsService', () => {
  let service: JobsService;

  const mockDb = {
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn()
  };

  const mockDbService = {
    getDB: jest.fn().mockReturnValue(mockDb)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: DatabaseService,
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
      mockDb.run.mockResolvedValue({});
      await service.createJob(1, 'Cleaning');
      expect(mockDb.run).toHaveBeenCalledTimes(1);
    });

    it('Should serialize tasks as JSON before inserting', async () => {
      mockDb.run.mockResolvedValue({});
      await service.createJob(1, 'Cleaning');
    
      const args = mockDb.run.mock.calls[0];
      const tasks = args[1][2];

      expect(typeof tasks).toBe('string');
      expect(() => JSON.parse(tasks)).not.toThrow();
    });
  });

  describe('updateJobStatus()', () => {
    it('Should update job status', async () => {
      const mockJob = {
        id: 1,
        mission_id: 1,
        job_title: 'Exterior Clean',
        job_status: 'Backlog',
        tasks: '[]'
      };
      const updatedJob = {...mockJob, job_status: 'Accepted'};
      mockDb.get
      .mockResolvedValueOnce(mockJob) //check job exists
      .mockResolvedValueOnce(updatedJob) // return job with updated status
      mockDb.run.mockResolvedValue({});

      const res = await service.updateJobStatus(1, {job_status: 'Accepted'});
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE jobs SET job_status'),
        'Accepted', 1
      );
      expect(res).toEqual(updatedJob);
    });
  });

  describe('updateTaskStatus()', () => {
    it('Updates task status and returns job with parsed tasks', async () => {
      const mockJob = {
        id: 1,
        mission_id: 1,
        job_title: 'Exterior Clean',
        job_status: 'Backlog',
        tasks: JSON.stringify([
          {key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}
        ])
      };

      mockDb.get
      .mockResolvedValueOnce(mockJob)
      .mockResolvedValueOnce({
        ...mockJob,
        tasks: JSON.stringify([
          {key: 'clean-1', description: 'Wash vehicle', task_status: 'Accepted'}
        ])
      });
      mockDb.run.mockResolvedValue({});

      const res = await service.updateTaskStatus(1, 'clean-1', 'Accepted');
      expect(res).toEqual({
        id: 1,
        mission_id: 1,
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
          id: 1,
          mission_id: 1,
          job_title: 'Exterior Clean',
          job_status: 'Backlog',
          tasks: JSON.stringify([{key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}])
        },
        {
          id: 2,
          mission_id: 1,
          job_title: 'Interior Clean',
          job_status: 'Backlog',
          tasks: JSON.stringify([{key: 'clean-2', description: 'Clean interior', task_status: 'Waiting'}])
        }
      ];
      mockDb.all.mockResolvedValue(mockJobs);
      const res = await service.backlogJobs();

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('WHERE job_status = \'Backlog\'')
      );
      expect(res).toHaveLength(2);
    });
  });

  describe('getJobById()', () => {
    it('Returns job with parsed tasks', async () => {
      mockDb.get.mockResolvedValue({
        id: 1,
        mission_id: 1,
        job_title: 'Exterior clean',
        job_status: 'Backlog',
        tasks: JSON.stringify([
          {key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}
        ])
      });
      const res = await service.getJobById(1);
      
      expect(res).toEqual({
        id: 1,
        mission_id: 1,
        job_title: 'Exterior clean',
        job_status: 'Backlog',
        tasks: [
          {key: 'clean-1', description: 'Wash vehicle', task_status: 'Waiting'}
        ]
      });
    });
  });
});
 