import { RolesGuard } from "./roles.guard";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate()', () => {
    it('Returns true if no roles required', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {role: 'USER'}
          })
        })
      } as unknown as ExecutionContext;

      const res = guard.canActivate(mockContext);
      expect(res).toBe(true);
    });

    it('Should return true if user role matches required role', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {role: 'ADMIN'}
          })
        })
      } as unknown as ExecutionContext;

      const res = guard.canActivate(mockContext);
      expect(res).toBe(true);
    });

    it('Should return false if user role does not match', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {role: 'USER'}
          })
        })
      } as unknown as ExecutionContext;

      const res = guard.canActivate(mockContext);
      expect(res).toBe(false);
    });
  });
});