import { TestingModule, Test } from "@nestjs/testing";
import { ApiClient } from "../core-client/api-client";
import { MissionsService } from "./missions.service";
import { JobsGateway } from "../jobs/jobs.gateway";

describe('MissionsService', () => {
  let service: MissionsService;

  const mockApiClient = {
    createMission: jest.fn(),
    getMission: jest.fn(),
    updateMissionStatus: jest.fn()
  };

  const mockJobsGateway = {
    broadcastJobs: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionsService,
        {
          provide: ApiClient,
          useValue: mockApiClient
        },
        {
          provide: JobsGateway,
          useValue: mockJobsGateway
        }
      ]
    }).compile()
    service = module.get<MissionsService>(MissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('Calls API with mission type', async () => {
      const mockMission = {
        id: '1',
        mission_type: 'Cleaning',
        mission_status: 'Created'
      };
      mockApiClient.createMission.mockResolvedValue(mockMission);
      const res = await service.create({mission_type: 'Cleaning'});

      expect(mockApiClient.createMission).toHaveBeenCalledWith('Cleaning');
      expect(res).toEqual(mockMission);
    });
  });

  describe('findOne()', () => {
    it('Calls API with id and returns mission with jobs', async () => {
      const mockMission = {
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
      };
      mockApiClient.getMission.mockResolvedValue(mockMission);
      const res = await service.findOne('1');

      expect(mockApiClient.getMission).toHaveBeenCalledWith('1');
      expect(res).toEqual(mockMission);
      expect(res.jobs).toHaveLength(1);
    });
  });

  describe('updateStatus()', () => {
    it('Should call API and return updated mission', async () => {
      const mockMission = {
        id: '1',
        mission_type: 'Cleaning',
        mission_status: 'In Progress'
      };
      mockApiClient.updateMissionStatus.mockResolvedValue(mockMission);

      const res = await service.updateStatus('1', {mission_status: 'In Progress'});

      expect(mockApiClient.updateMissionStatus).toHaveBeenCalledWith('1', 'In Progress');
      expect(res).toEqual(mockMission);
    })
  })
});