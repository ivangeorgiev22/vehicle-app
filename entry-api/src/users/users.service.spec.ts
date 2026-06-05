import { TestingModule, Test } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { ApiClient } from "../core-client/api-client";

describe('UsersService', () => {
  let service: UsersService;

  const mockApiClient = {
    uploadImage: jest.fn(),
    getImage: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: ApiClient,
          useValue: mockApiClient
        }
      ]
    }).compile();
    service = module.get<UsersService>(UsersService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage()', () => {
    it('Calls API with id and file', async () => {
      const mockFile = {originalName: 'photo.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('')} as unknown as Express.Multer.File;
      mockApiClient.uploadImage.mockResolvedValue({image_url: 'https://s3.amazonaws.com/photo.jpg'});

      await service.uploadImage(1, mockFile);
      expect(mockApiClient.uploadImage).toHaveBeenCalledWith(1, mockFile);
    });

    it('Returns presigned url on success', async () => {
      const mockFile = {originalName: 'photo.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('')} as unknown as Express.Multer.File;
      const mockRes = {image_url: 'https://s3.amazonaws.com/photo.jpg'};
      mockApiClient.getImage.mockResolvedValue(mockRes);

      const res = await service.uploadImage(1, mockFile);
      expect(res).toEqual(mockRes);
    });
  });

  describe('getImage()', () => {
    it('Calls API with correct id', async () => {
      mockApiClient.getImage.mockResolvedValue({image_url: null});
      await service.getImage(1);
      expect(mockApiClient.getImage).toHaveBeenCalledWith(1);
    });

    it('Returns presigned url', async () => {
      const mockRes = {image_url: 'https://s3.amazonaws.com/photo.jpg'};
      mockApiClient.getImage.mockResolvedValue(mockRes);

      const res = await service.getImage(1);

      expect(res).toEqual(mockRes);
      expect(res.image_url).not.toBeNull();
    });

    it('Should return null if no image uploaded', async () => {
      mockApiClient.getImage.mockResolvedValue({image_url: null});

      const res = await service.getImage(1);
      expect(res.image_url).toBeNull();
    });
  });
});