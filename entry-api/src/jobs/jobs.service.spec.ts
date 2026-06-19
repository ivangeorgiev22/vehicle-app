import { TestingModule, Test } from "@nestjs/testing";
import { JobsService } from "./jobs.service";
import { ApiClient } from "../core-client/api-client";

describe('JobsService', () => {
  let service: JobsService;

  const mockApiClient = {
    updateJobStatus: jest.fn(),
    updateTaskStatus: jest.fn(),
    getBacklogJobs: jest.fn(),
    getJobById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: ApiClient,
          useValue: mockApiClient
        }
      ]
    }).compile()
    service = module.get<JobsService>(JobsService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStatus()', () => {
    it('Calls API with id and job status', async () => {
      const mockJob = {
        id: '1',
        mission_id: '1',
        job_title: 'Exterior Clean',
        job_status: 'Backlog',
        tasks: []
      };
      mockApiClient.updateJobStatus.mockResolvedValue(mockJob);
      await service.updateStatus('1', {job_status: 'Accepted'});

      expect(mockApiClient.updateJobStatus).toHaveBeenCalledWith('1', 'Accepted');
    });
  });

  describe('updateTaskStatus()', () => {
    it('Calls API with id, key and task status', async () => {
      const mockJob = {
        id: '1',
        mission_id: '1',
        job_title: 'Exterior Clean',
        job_status: 'Backlog',
        tasks: [
          {key: 'clean-1', description: 'Wash Vehicle', task_status: 'Waiting'}
        ]
      };
      mockApiClient.updateTaskStatus.mockResolvedValue(mockJob);
      await service.updateTaskStatus('1', 'clean-1', {task_status: 'Accepted'});

      expect(mockApiClient.updateTaskStatus).toHaveBeenCalledWith('1', 'clean-1', 'Accepted');
    });
  });

  describe('getBacklogJobs()', () => {
    it('Calls API and returns Backlog jobs', async () => {
      const mockJob = [
        {
          id: '1',
          mission_id: '1',
          job_title: 'Exterior Clean',
          job_status: 'Backlog',
          tasks: [{key: 'clean-1', description: 'Exterior clean', task_status: 'Waiting'}]
        }
      ];
      mockApiClient.getBacklogJobs.mockResolvedValue([]);
      mockApiClient.getBacklogJobs.mockResolvedValue(mockJob);

      const res = await service.getBacklogJobs();

      expect(mockApiClient.getBacklogJobs).toHaveBeenCalled();
      expect(res).toEqual(mockJob);
      expect(res).toHaveLength(1);
    });
  });

  describe('getJobById()', () => {
    it('Calls API with correct id', async () => {
      mockApiClient.getJobById.mockResolvedValue(null);
      await service.getJobById('1');

      expect(mockApiClient.getJobById).toHaveBeenCalledWith('1');
    });
    it('Returns job on success', async () => {
      const mockJob = {
        id: '1',
        mission_id: '1',
        job_title: 'Exterior Clean',
        job_status: 'Backlog',
        tasks: [
          {key: 'clean-1', description: 'Wash vehicle', task_status: 'Waitign'}
        ]
      };
      mockApiClient.getJobById.mockResolvedValue(mockJob);
      const res = await service.getJobById('1');
      
      expect(res).toEqual(mockJob);
    });
  });
});