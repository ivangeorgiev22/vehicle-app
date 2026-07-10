import { TestingModule, Test } from "@nestjs/testing";
import { ApiClient } from "../core-client/api-client";
import { MissionsService } from "./missions.service";
import { JobsGateway } from "../jobs/jobs.gateway";
import { SFNClient } from "@aws-sdk/client-sfn";

describe('MissionsService', () => {
  let service: MissionsService;

  const mockSfn = jest.fn().mockResolvedValue({});

  const mockApiClient = {
    createMission: jest.fn(),
    getMission: jest.fn(),
    updateMissionStatus: jest.fn()
  };

  const mockJobsGateway = {
    broadcastJobs: jest.fn()
  }

  beforeEach(async () => {
    jest.spyOn(SFNClient.prototype, 'send').mockImplementation(mockSfn);

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
    it('Triggers Step Function execution', async () => {
      await service.create({type: 'Cleaning', vehicleId: 'vehicle-1'});
      expect(mockSfn).toHaveBeenCalledTimes(1);
    })
  });

  describe('findOne()', () => {
    it('Calls API with id and returns mission with jobs', async () => {
      const mockMission = {
        id: '1',
        type: 'Cleaning',
        missionStatus: 'Created',
        jobs: [
          {
            id: '1',
            mission_id: '1',
            title: 'Exterior Clean',
            jobStatus: 'Backlog',
            tasks: [
              {key: 'clean-1', description: 'Wash vehicle', taskStatus: 'Waiting'}
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
        type: 'Cleaning',
        missionStatus: 'In Progress'
      };
      mockApiClient.updateMissionStatus.mockResolvedValue(mockMission);

      const res = await service.updateStatus('1', {missionStatus: 'In Progress'});

      expect(mockApiClient.updateMissionStatus).toHaveBeenCalledWith('1', 'In Progress');
      expect(res).toEqual(mockMission);
    })
  })
});