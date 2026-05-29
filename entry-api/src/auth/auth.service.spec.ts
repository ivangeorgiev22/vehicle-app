import { Test, TestingModule } from "@nestjs/testing";
import { ApiClient } from "../core-client/api-client";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";

describe('AuthService', () => {
  let service: AuthService;

  //mock core-api
  const mockApiClient = {
    validateUser: jest.fn()
  };

  //mock JwtService
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt-token')
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ApiClient, useValue: mockApiClient },
        { provide: JwtService, useValue: mockJwtService }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService)
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Login()', () => {

    it('Calls validateUser with username and password', async () => {
      const mockUser = { id: 1, username: 'john', role: 'USER' };
      mockApiClient.validateUser.mockResolvedValue(mockUser);

      await service.login('john', '123456');

      expect(mockApiClient.validateUser).toHaveBeenCalledWith('john', '123456');
    });

    it('Calls jwtService.sign with the correct payload', async () => {
      const mockUser = { id: 1, username: 'john', role: 'USER'};
      mockApiClient.validateUser.mockResolvedValue(mockUser);

      await service.login('john', '123456');

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        username: 'john',
        role: 'USER'
      });
    });

    it('Returns accessToken and user on success', async () => {
      const mockUser = { id: 1, username: 'john', role: 'USER' };
      mockApiClient.validateUser.mockResolvedValue(mockUser);

      const res = await service.login('john', '123456');

      expect(res).toEqual({
        accessToken: 'jwt-token',
        user: mockUser
      });
    });
  });
});