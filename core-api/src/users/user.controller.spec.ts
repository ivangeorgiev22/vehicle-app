import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./user.controller";
import { UsersService } from "./users.service";
import { UsersImageService } from "./users-image.service";

describe('UsersController', () => {
  let controller: UsersController;

  //mock UsersService
  const mockUsersService = {
    create: jest.fn(),
    validateUser: jest.fn()
  };

  //mock UsersImageService
  const mockUsersImageService = {
    uploadImage: jest.fn(),
    getImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService
        },
        {
          provide: UsersImageService,
          useValue: mockUsersImageService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create()', () => {

    it('Calls service with correct data', async () => {

      const userObj = {
        username: 'john',
        password: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@test.com'
      };

      mockUsersService.create.mockResolvedValue({ id: '1', username: 'john'});

      const res = await controller.create(userObj);

      expect(mockUsersService.create).toHaveBeenCalledWith(userObj);
      expect(res).toEqual({ id: '1', username: 'john' });
    });
  });

  describe('Validate()', () => {

    it('Calls service with username and password', async () => {
      const reqBody = { username: 'john', password: '123456'};
      const userObj = { id: '1', username: 'john', role: 'USER'};
      mockUsersService.validateUser.mockResolvedValue(userObj);

      const res = await controller.validate(reqBody);

      expect(mockUsersService.validateUser).toHaveBeenCalledWith('john', '123456');
      expect(res).toEqual(userObj);
    });

    it('Returns null if credentials are invalid', async () => {
      const reqBody = { username: 'john', password: 'diffpass' };
      mockUsersService.validateUser.mockResolvedValue(null);

      const res = await controller.validate(reqBody);

      expect(res).toBeNull();
    });
  })
})