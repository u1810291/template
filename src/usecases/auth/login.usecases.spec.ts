/* eslint-disable @typescript-eslint/unbound-method */

import { LoginUseCases } from './login.usecases';
import { ILogger } from '@domain/logger/logger.interface';
import { IJwtService } from '@domain/adapters/jwt.interface';
import { JWTConfig } from '@domain/config/jwt.interface';
import { UserRepositoryI } from '@domain/repositories/user-repository.interface';
import { IBcryptService } from '@domain/adapters/bcrypt.interface';
import { Users } from '@prisma/client';

describe('LoginUseCases', () => {
  let loginUseCases: LoginUseCases;
  let mockLogger: jest.Mocked<ILogger>;
  let mockJwtService: jest.Mocked<IJwtService>;
  let mockJwtConfig: jest.Mocked<JWTConfig>;
  let mockUserRepository: jest.Mocked<UserRepositoryI>;
  let mockBcryptService: jest.Mocked<IBcryptService>;

  const createMockUser = (overrides?: Partial<Users>): Users => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    hashRefreshToken: 'hashed_refresh_token',
    ...overrides,
  });

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as jest.Mocked<ILogger>;

    mockJwtService = {
      createToken: jest.fn(),
      checkToken: jest.fn(),
    } as jest.Mocked<IJwtService>;

    mockJwtConfig = {
      getJwtSecret: jest.fn().mockReturnValue('secret'),
      getJwtExpirationTime: jest.fn().mockReturnValue('3600'),
      getJwtRefreshSecret: jest.fn().mockReturnValue('refresh_secret'),
      getJwtRefreshExpirationTime: jest.fn().mockReturnValue('86400'),
    } as jest.Mocked<JWTConfig>;

    mockUserRepository = {
      getUserByEmail: jest.fn(),
      updateLastLogin: jest.fn(),
      updateRefreshToken: jest.fn(),
      register: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryI>;

    mockBcryptService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as jest.Mocked<IBcryptService>;

    loginUseCases = new LoginUseCases(
      mockLogger,
      mockJwtService,
      mockJwtConfig,
      mockUserRepository,
      mockBcryptService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCookieWithJwtToken', () => {
    it('should generate JWT token cookie with correct format', () => {
      // Arrange
      const email = 'test@example.com';
      const mockToken = 'mock_jwt_token';
      mockJwtService.createToken.mockReturnValue(mockToken);

      // Act
      const result = loginUseCases.getCookieWithJwtToken(email);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        'LoginUseCases execute',
        `The user email ${email} have been logged.`,
      );
      expect(mockJwtService.createToken).toHaveBeenCalledWith(
        { email },
        'secret',
        '3600s',
      );
      expect(result).toBe(
        `Authentication=${mockToken}; HttpOnly; Path=/; Max-Age=3600`,
      );
    });
  });

  describe('getCookieWithJwtRefreshToken', () => {
    it('should generate refresh token cookie and update user', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockRefreshToken = 'mock_refresh_token';
      const hashedToken = 'hashed_refresh_token';

      mockJwtService.createToken.mockReturnValue(mockRefreshToken);
      mockBcryptService.hash.mockResolvedValue(hashedToken);

      // Act
      const result = await loginUseCases.getCookieWithJwtRefreshToken(email);

      // Assert
      expect(mockJwtService.createToken).toHaveBeenCalledWith(
        { email },
        'refresh_secret',
        '86400s',
      );
      expect(mockBcryptService.hash).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockUserRepository.updateRefreshToken).toHaveBeenCalledWith(
        email,
        hashedToken,
      );
      expect(result).toBe(
        `Refresh=${mockRefreshToken}; HttpOnly; Path=/; Max-Age=86400`,
      );
    });
  });

  describe('validateUserForLocalStrategy', () => {
    it('should return user without password when credentials are valid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = createMockUser({ email });

      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockBcryptService.compare.mockResolvedValue(true);

      // Act
      const result = await loginUseCases.validateUserForLocalStrategy(
        email,
        password,
      );

      // Assert
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(mockBcryptService.compare).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(email);
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe(email);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      // Act
      const result = await loginUseCases.validateUserForLocalStrategy(
        'nonexistent@example.com',
        'password',
      );

      // Assert
      expect(result).toBeNull();
      expect(mockBcryptService.compare).not.toHaveBeenCalled();
      expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should return null when password does not match', async () => {
      // Arrange
      const mockUser = createMockUser();
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockBcryptService.compare.mockResolvedValue(false);

      // Act
      const result = await loginUseCases.validateUserForLocalStrategy(
        'test@example.com',
        'wrong_password',
      );

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  describe('validateUserForJWTStrategy', () => {
    it('should return user when found by email', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = createMockUser({ email });
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await loginUseCases.validateUserForJWTStrategy(email);

      // Assert
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      // Act
      const result = await loginUseCases.validateUserForJWTStrategy(
        'nonexistent@example.com',
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getUserIfRefreshTokenMatches', () => {
    it('should return user when refresh token matches', async () => {
      // Arrange
      const email = 'test@example.com';
      const refreshToken = 'refresh_token';
      const mockUser = createMockUser({ email });

      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockBcryptService.compare.mockResolvedValue(true);

      // Act
      const result = await loginUseCases.getUserIfRefreshTokenMatches(
        refreshToken,
        email,
      );

      // Assert
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(mockBcryptService.compare).toHaveBeenCalledWith(
        refreshToken,
        mockUser.hashRefreshToken,
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      // Act
      const result = await loginUseCases.getUserIfRefreshTokenMatches(
        'token',
        'test@example.com',
      );

      // Assert
      expect(result).toBeNull();
      expect(mockBcryptService.compare).not.toHaveBeenCalled();
    });

    it('should return null when user has no refresh token', async () => {
      // Arrange
      const mockUser = createMockUser({ hashRefreshToken: null });
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await loginUseCases.getUserIfRefreshTokenMatches(
        'token',
        'test@example.com',
      );

      // Assert
      expect(result).toBeNull();
      expect(mockBcryptService.compare).not.toHaveBeenCalled();
    });

    it('should return null when refresh token does not match', async () => {
      // Arrange
      const mockUser = createMockUser();
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockBcryptService.compare.mockResolvedValue(false);

      // Act
      const result = await loginUseCases.getUserIfRefreshTokenMatches(
        'wrong_token',
        'test@example.com',
      );

      // Assert
      expect(result).toBeNull();
    });
  });
});
