import { ApiClient } from "./api-client";
import axios from "axios";

process.env.BASE_URL = 'http://localhost:3000'

jest.mock('axios', () => ({
  post: jest.fn()
}));

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient()
  });

  afterEach(() => {
    jest.clearAllMocks()
  });

  describe('validateUser', () => {

    it('Calls the correct endpoint with username and password', async () => {
      const mockRes = {data: { id: '1', username: 'john', role: 'USER' } };
      (axios.post as jest.Mock).mockResolvedValue(mockRes);

      await client.validateUser('john', '123456');

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/validate',
        {username: 'john', password: '123456'}
      );
    });

    it('Returns res.data on success', async () => {
      const mockUser = { id: '1', username: 'john', role: 'USER'};
      (axios.post as jest.Mock).mockResolvedValue({ data: mockUser });

      const res = await client.validateUser('john', '123456');

      expect(res).toEqual(mockUser);
    })
  });
})