/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { Symbols } from '@domain/symbols';
import { Users } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;

  const mockLoginUseCase = {
    getCookieWithJwtToken: jest.fn(),
    getCookieWithJwtRefreshToken: jest.fn(),
  };

  const mockLogoutUseCase = {
    execute: jest.fn(),
  };

  const mockRegisterUseCase = {
    execute: jest.fn(),
  };

  const mockIsAuthUseCase = {
    execute: jest.fn(),
  };

  const createMockUser = (overrides?: Partial<Users>): Users => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    hashRefreshToken: null,
    ...overrides,
  });

  const createMockRequest = (userEmail?: string) => ({
    user: userEmail ? { email: userEmail } : undefined,
    res: {
      setHeader: jest.fn(),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: Symbols.LOGIN_USECASES_PROXY,
          useValue: {
            getInstance: () => mockLoginUseCase,
          },
        },
        {
          provide: Symbols.LOGOUT_USECASES_PROXY,
          useValue: {
            getInstance: () => mockLogoutUseCase,
          },
        },
        {
          provide: Symbols.REGISTER_USECASES_PROXY,
          useValue: {
            getInstance: () => mockRegisterUseCase,
          },
        },
        {
          provide: Symbols.IS_AUTHENTICATED_USECASES_PROXY,
          useValue: {
            getInstance: () => mockIsAuthUseCase,
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should set authentication cookies and return success message', async () => {
      // Arrange
      const authDto = { email: 'test@example.com', password: 'password123' };
      const mockRequest = createMockRequest();
      const accessCookie =
        'Authentication=token; HttpOnly; Path=/; Max-Age=3600';
      const refreshCookie =
        'Refresh=refresh_token; HttpOnly; Path=/; Max-Age=86400';

      mockLoginUseCase.getCookieWithJwtToken.mockReturnValue(accessCookie);
      mockLoginUseCase.getCookieWithJwtRefreshToken.mockResolvedValue(
        refreshCookie,
      );

      // Act
      const result = await controller.login(authDto, mockRequest as any);

      // Assert
      expect(mockLoginUseCase.getCookieWithJwtToken).toHaveBeenCalledWith(
        authDto.email,
      );
      expect(
        mockLoginUseCase.getCookieWithJwtRefreshToken,
      ).toHaveBeenCalledWith(authDto.email);
      expect(mockRequest.res.setHeader).toHaveBeenCalledWith('Set-Cookie', [
        accessCookie,
        refreshCookie,
      ]);
      expect(result).toBe('Login successful');
    });

    it('should handle login with different email', async () => {
      // Arrange
      const authDto = { email: 'another@example.com', password: 'pass' };
      const mockRequest = createMockRequest();

      mockLoginUseCase.getCookieWithJwtToken.mockReturnValue('cookie1');
      mockLoginUseCase.getCookieWithJwtRefreshToken.mockResolvedValue(
        'cookie2',
      );

      // Act
      await controller.login(authDto, mockRequest as any);

      // Assert
      expect(mockLoginUseCase.getCookieWithJwtToken).toHaveBeenCalledWith(
        'another@example.com',
      );
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success message', () => {
      // Arrange
      const mockRequest = createMockRequest('test@example.com');
      const logoutCookie = 'Authentication=; HttpOnly; Path=/; Max-Age=0';
      mockLogoutUseCase.execute.mockReturnValue(logoutCookie);

      // Act
      const result = controller.logout(mockRequest as any);

      // Assert
      expect(mockLogoutUseCase.execute).toHaveBeenCalled();
      expect(mockRequest.res.setHeader).toHaveBeenCalledWith(
        'Set-Cookie',
        logoutCookie,
      );
      expect(result).toBe('Logout successful');
    });
  });

  describe('isAuthenticated', () => {
    it('should return user email when authenticated', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockRequest = createMockRequest(email);
      const mockUser = createMockUser({ email });
      mockIsAuthUseCase.execute.mockResolvedValue(mockUser);

      // Act
      const result = await controller.isAuthenticated(mockRequest as any);

      // Assert
      expect(mockIsAuthUseCase.execute).toHaveBeenCalledWith(email);
      expect(result.email).toBe(email);
    });

    it('should return empty string when user not found', async () => {
      // Arrange
      const mockRequest = createMockRequest('test@example.com');
      mockIsAuthUseCase.execute.mockResolvedValue(null);

      // Act
      const result = await controller.isAuthenticated(mockRequest as any);

      // Assert
      expect(result.email).toBe('');
    });

    it('should handle missing user email in request', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      mockIsAuthUseCase.execute.mockResolvedValue(null);

      // Act
      const result = await controller.isAuthenticated(mockRequest as any);

      // Assert
      expect(mockIsAuthUseCase.execute).toHaveBeenCalledWith('');
      expect(result.email).toBe('');
    });
  });

  describe('refresh', () => {
    it('should refresh access token and set cookie', () => {
      // Arrange
      const email = 'test@example.com';
      const mockRequest = createMockRequest(email);
      const newAccessCookie = 'Authentication=new_token; HttpOnly; Path=/';
      mockLoginUseCase.getCookieWithJwtToken.mockReturnValue(newAccessCookie);

      // Act
      const result = controller.refresh(mockRequest as any);

      // Assert
      expect(mockLoginUseCase.getCookieWithJwtToken).toHaveBeenCalledWith(
        email,
      );
      expect(mockRequest.res.setHeader).toHaveBeenCalledWith(
        'Set-Cookie',
        newAccessCookie,
      );
      expect(result).toBe('Refresh successful');
    });

    it('should handle refresh with missing user email', () => {
      // Arrange
      const mockRequest = createMockRequest();
      mockLoginUseCase.getCookieWithJwtToken.mockReturnValue('cookie');

      // Act
      const result = controller.refresh(mockRequest as any);

      // Assert
      expect(mockLoginUseCase.getCookieWithJwtToken).toHaveBeenCalledWith('');
      expect(result).toBe('Refresh successful');
    });
  });

  describe('register', () => {
    it('should register user and set authentication cookies', async () => {
      // Arrange
      const registerDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };
      const mockRequest = createMockRequest();
      const registeredUser = createMockUser(registerDto);
      const accessCookie = 'Authentication=token; HttpOnly';
      const refreshCookie = 'Refresh=refresh; HttpOnly';

      mockRegisterUseCase.execute.mockResolvedValue(registeredUser);
      mockLoginUseCase.getCookieWithJwtToken.mockReturnValue(accessCookie);
      mockLoginUseCase.getCookieWithJwtRefreshToken.mockResolvedValue(
        refreshCookie,
      );

      // Act
      const result = await controller.register(registerDto, mockRequest as any);

      // Assert
      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith(registerDto);
      expect(mockLoginUseCase.getCookieWithJwtToken).toHaveBeenCalledWith(
        registeredUser.email,
      );
      expect(
        mockLoginUseCase.getCookieWithJwtRefreshToken,
      ).toHaveBeenCalledWith(registeredUser.email);
      expect(mockRequest.res.setHeader).toHaveBeenCalledWith('Set-Cookie', [
        accessCookie,
        refreshCookie,
      ]);
      expect(result).toBe('Successfully registered');
    });

    it('should use registered user email for cookie generation', async () => {
      // Arrange
      const registerDto = {
        email: 'specific@example.com',
        name: 'User',
        password: 'pass',
      };
      const mockRequest = createMockRequest();
      const registeredUser = createMockUser({ email: 'specific@example.com' });

      mockRegisterUseCase.execute.mockResolvedValue(registeredUser);
      mockLoginUseCase.getCookieWithJwtToken.mockReturnValue('cookie');
      mockLoginUseCase.getCookieWithJwtRefreshToken.mockResolvedValue(
        'refresh',
      );

      // Act
      await controller.register(registerDto, mockRequest as any);

      // Assert
      expect(mockLoginUseCase.getCookieWithJwtToken).toHaveBeenCalledWith(
        'specific@example.com',
      );
      expect(
        mockLoginUseCase.getCookieWithJwtRefreshToken,
      ).toHaveBeenCalledWith('specific@example.com');
    });
  });
});
