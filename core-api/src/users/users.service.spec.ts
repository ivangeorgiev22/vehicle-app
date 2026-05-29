import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { DatabaseService } from "../database/database.service";
import * as bcrypt from 'bcrypt';

// we mock the entire brypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn(),
}));

describe("UsersService", () => {
  let service: UsersService;
  
  //fake DB object for testing purposes 
  const mockDb = {
    run: jest.fn(),
    get: jest.fn()
  };

  //fake DB Service to be able to use getDB
  const mockDbService = {
    getDB: jest.fn().mockReturnValue(mockDb)
  };

  //set up a new NestJS app before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: mockDbService
        }
      ]
    }).compile();
    // get the actual service instance from the module.
    service = module.get<UsersService>(UsersService);
  });

  //after each test we clear the mocks 
  afterEach(() => {
    jest.clearAllMocks();
  });

  // now we can test each method in UsersService
  describe('Create()', () => {
    
    it('Should hash the password before inserting into DB', async () => {

      const userObj = {
        username: 'john',
        password: '123456',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@test.com'
      };

      //run fake DB and specify what to return
      mockDb.run.mockResolvedValue({ lastID: 1 });

      await service.create(userObj);

      //bcrypt.hash should have been called with password from userObj
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    });

    it('Should return id and username on successful insertion', async () => {
      const userObj = {
        username: 'john',
        password: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@test.com'
      };

      mockDb.run.mockResolvedValue({ lastID: 1 });

      const res = await service.create(userObj);

      expect(res).toEqual({ id: 1, username: 'john' });
    });
  });

  describe('validateUser()', () => {

    it('Should return null if user does not exist', async () => {
      //fake db returns nothing - user not found 
      mockDb.get.mockResolvedValue(null);

      const res = await service.validateUser('mike', '12344');

      expect(res).toBeNull();
    });

    it('Should return null if password does not match', async () => {
      //mocked db returns a user object
      mockDb.get.mockResolvedValue({
        id: 1,
        username: 'john',
        password: 'hashedpassword',
        role: 'USER'
      });
      //bcrypt.compare purposely returns false as if password is wrong
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      //pass the credentials to service for validation
      const res = await service.validateUser('john', 'differentpassword');

      expect(res).toBeNull();
    });

    it('Should return user without passowrd on success', async () => {
      //db query gives us the user obj
      mockDb.get.mockResolvedValue({
        id: 1,
        username: 'john',
        password: 'hashedpassword',
        role: 'USER'
      });
      //bcrypt compare returns true 
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await service.validateUser('john', 'correctpassword');

      expect(res).not.toHaveProperty('password');
      expect(res).toEqual({ id: 1, username: 'john', role: 'USER' });
    });
  });
})