import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe('AuthController', () => {

  let controller: AuthController;

  //mock service
  const mockAuthService = {
    login: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {provide: AuthService, useValue: mockAuthService}
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Login()', () => {

    it('Calls service with username and password', async () => {
      const userCred = { username: 'john', password: '123456'};
      mockAuthService.login.mockResolvedValue({
        accessToken: 'jwt-token',
        user: { id: 1, username: 'john', role: 'USER'}
      });

      await controller.login(userCred);

      expect(mockAuthService.login).toHaveBeenCalledWith('john', '123456');
    });

    it('Return accessToken and user on success', async () => {
      const userCred = { username: 'john', password: '123456'};
      const mockRes = {
        accessToken: 'jwt-token',
        user: { id: 1, username: 'john', role: 'USER'}
      };
      mockAuthService.login.mockResolvedValue(mockRes);

      const res = await controller.login(userCred);

      expect(res).toEqual(mockRes);
    });
  });

  describe('getProfile()', () => {

    it('Returns req.user', () => {

      //mocked request obj that passport attaches the user to
      const mockReq = {
        user: { id: 1, username: 'john', role: 'USER'}
      };

      const res = controller.getProfile(mockReq);
      expect(res).toEqual(mockReq.user);
    });
  });
})