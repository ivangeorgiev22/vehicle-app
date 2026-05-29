import { JwtStrategy } from "./jwt.strategy";

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  describe('Validate()', () => {

    it('Returns mapped user object from JWT payload', async () => {

      //decoded JWT payload
      const payload = {
        sub: 1,
        username: 'john',
        role: 'USER'
      };

      const res = await strategy.validate(payload);
      //validate is expected to map sub to id
      expect(res).toEqual({
        id: 1,
        username: 'john',
        role: 'USER'
      });
    })
  })
})