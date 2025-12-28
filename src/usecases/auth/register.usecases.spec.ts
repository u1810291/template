/* eslint-disable @typescript-eslint/unbound-method */
import { RegisterUseCases } from './register.usecases';
import { UserRepositoryI } from '@domain/repositories/user-repository.interface';
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service';
import { Users } from '@prisma/client';

describe('RegisterUseCases', () => {
  let registerUseCases: RegisterUseCases;
  let mockUserRepository: jest.Mocked<UserRepositoryI>;
  let mockExceptionService: jest.Mocked<ExceptionsService>;

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

  beforeEach(() => {
    mockUserRepository = {
      getUserByEmail: jest.fn(),
      register: jest.fn(),
      updateLastLogin: jest.fn(),
      updateRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryI>;

    mockExceptionService = {
      BadRequestException: jest.fn(),
    } as unknown as jest.Mocked<ExceptionsService>;

    registerUseCases = new RegisterUseCases(
      mockUserRepository,
      mockExceptionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully register a new user when email does not exist', async () => {
      // Arrange
      const newUserData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };
      const expectedUser = createMockUser(newUserData);

      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.register.mockResolvedValue(expectedUser);

      // Act
      const result = await registerUseCases.execute(newUserData);

      // Assert
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
        newUserData.email,
      );
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.register).toHaveBeenCalledWith(newUserData);
      expect(mockUserRepository.register).toHaveBeenCalledTimes(1);
      expect(mockExceptionService.BadRequestException).not.toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should throw BadRequestException when user with email already exists', async () => {
      // Arrange
      const existingUserData = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };
      const existingUser = createMockUser({
        email: existingUserData.email,
        id: 'existing-id',
      });

      mockUserRepository.getUserByEmail.mockResolvedValue(existingUser);
      mockExceptionService.BadRequestException.mockImplementation(() => {
        throw new Error('User with this email is already exists');
      });

      // Act & Assert
      await expect(registerUseCases.execute(existingUserData)).rejects.toThrow(
        'User with this email is already exists',
      );
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
        existingUserData.email,
      );
      expect(mockExceptionService.BadRequestException).toHaveBeenCalledWith({
        code_error: 400,
        message: 'User with this email is already exists',
      });
      expect(mockUserRepository.register).not.toHaveBeenCalled();
    });

    it('should check user existence before attempting registration', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test',
        password: 'pass',
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.register.mockResolvedValue(createMockUser(userData));

      // Act
      await registerUseCases.execute(userData);

      // Assert
      const callOrder = [
        mockUserRepository.getUserByEmail.mock.invocationCallOrder[0],
        mockUserRepository.register.mock.invocationCallOrder[0],
      ];
      expect(callOrder[0]).toBeLessThan(callOrder[1]);
    });

    it('should handle user with id but no other data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test',
        password: 'pass',
      };
      const userWithIdOnly = { id: 'some-id' } as Users;

      mockUserRepository.getUserByEmail.mockResolvedValue(userWithIdOnly);

      // Act
      await registerUseCases.execute(userData);

      // Assert
      expect(mockExceptionService.BadRequestException).toHaveBeenCalledWith({
        code_error: 400,
        message: 'User with this email is already exists',
      });
    });

    it('should pass exact user data to repository register method', async () => {
      // Arrange
      const userData = {
        email: 'precise@example.com',
        name: 'Precise User',
        password: 'precise_password',
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.register.mockResolvedValue(createMockUser(userData));

      // Act
      await registerUseCases.execute(userData);

      // Assert
      expect(mockUserRepository.register).toHaveBeenCalledWith(userData);
      expect(mockUserRepository.register.mock.calls[0][0]).toEqual(userData);
    });
  });
});
