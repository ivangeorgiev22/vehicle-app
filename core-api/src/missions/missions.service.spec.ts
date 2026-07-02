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

  describe('findOne()', () => {
    it('Returns mission with jobs and tasks', async () => {
      const mockMission = {
        id: '1',
        missionType: 'Cleaning',
        missionStatus: 'Created'
      };
      
      const mockJob = [
        {
          id: '1',
          missionId: '1',
          jobTitle: 'Exterior Clean',
          jobStatus: 'Backlog',
          tasks: JSON.stringify([
            {key: 'clean-1', description: 'Wash vehicle', taskStatus: 'Waiting'}
          ])
        }
      ];

      mockDb.send.mockResolvedValueOnce({Item: mockMission});
      mockDb.send.mockResolvedValueOnce({Items: mockJob});

      const res = await service.findOne('1');
      expect(res).toEqual({
        id: '1',
        missionType: 'Cleaning',
        missionStatus: 'Created',
        jobs: [
          {
            id: '1',
            missionId: '1',
            jobTitle: 'Exterior Clean',
            jobStatus: 'Backlog',
            tasks: [
              {key: 'clean-1', description: 'Wash vehicle', taskStatus: 'Waiting'}
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
        missionType: 'Cleaning',
        missionStatus: 'Created'
      };

      mockDb.send
      .mockResolvedValueOnce({Item: mockMission})
      .mockResolvedValueOnce({});

      const res = await service.updateStatus('1', {missionStatus: 'In progress'});
      expect(mockDb.send).toHaveBeenCalledTimes(2);
      expect(res).toEqual({...mockMission});
    })
  })
});