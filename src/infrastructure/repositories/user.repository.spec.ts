/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseUserRepository } from './user.repository';
import { PrismaService } from '@config/prisma/prisma.service';
import { BcryptService } from '@infrastructure/services/bcrypt/bcrypt.service';
import { Users } from '@prisma/client';

describe('DatabaseUserRepository', () => {
  let repository: DatabaseUserRepository;
  let prismaService: PrismaService;
  let bcryptService: BcryptService;

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

  beforeEach(async () => {
    const mockPrismaService = {
      users: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockBcryptService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseUserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: BcryptService,
          useValue: mockBcryptService,
        },
      ],
    }).compile();

    repository = module.get<DatabaseUserRepository>(DatabaseUserRepository);
    prismaService = module.get(PrismaService);
    bcryptService = module.get(BcryptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = createMockUser({ email });
      (prismaService.users.findFirst as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await repository.getUserByEmail(email);

      // Assert
      expect(prismaService.users.findFirst).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      (prismaService.users.findFirst as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.getUserByEmail(email);

      // Assert
      expect(prismaService.users.findFirst).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const email = 'test@example.com';
      const dbError = new Error('Database connection failed');
      (prismaService.users.findFirst as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.getUserByEmail(email)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('updateRefreshToken', () => {
    it('should update user refresh token', async () => {
      // Arrange
      const email = 'test@example.com';
      const refreshToken = 'new_refresh_token';
      const updatedUser = createMockUser({
        email,
        hashRefreshToken: refreshToken,
      });
      (prismaService.users.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act
      await repository.updateRefreshToken(email, refreshToken);

      // Assert
      expect(prismaService.users.update).toHaveBeenCalledWith({
        where: { email },
        data: { hashRefreshToken: refreshToken },
      });
    });

    it('should handle update with different refresh tokens', async () => {
      // Arrange
      const email = 'test@example.com';
      const refreshToken = 'another_token';
      (prismaService.users.update as jest.Mock).mockResolvedValue(
        createMockUser(),
      );

      // Act
      await repository.updateRefreshToken(email, refreshToken);

      // Assert
      expect(prismaService.users.update).toHaveBeenCalledWith({
        where: { email },
        data: { hashRefreshToken: refreshToken },
      });
    });
  });

  describe('register', () => {
    it('should hash password and create new user', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'plain_password',
      };
      const hashedPassword = 'hashed_password_123';
      const createdUser = createMockUser({
        ...userData,
        password: hashedPassword,
      });

      (bcryptService.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prismaService.users.create as jest.Mock).mockResolvedValue(createdUser);

      // Act
      const result = await repository.register(userData);

      // Assert
      expect(bcryptService.hash).toHaveBeenCalledWith(userData.password);
      expect(prismaService.users.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        },
      });
      expect(result).toEqual(createdUser);
      expect(result.password).toBe(hashedPassword);
    });

    it('should create user with hashed password not plain text', async () => {
      // Arrange
      const userData = {
        email: 'secure@example.com',
        name: 'Secure User',
        password: 'my_plain_password',
      };
      const hashedPassword = 'super_secure_hash';

      (bcryptService.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prismaService.users.create as jest.Mock).mockResolvedValue(
        createMockUser({ password: hashedPassword }),
      );

      // Act
      await repository.register(userData);

      // Assert

      const createCall = (prismaService.users.create as jest.Mock).mock
        .calls[0][0] as {
        data: { password: string; email: string; name: string };
      };
      expect(createCall.data.password).toBe(hashedPassword);
      expect(createCall.data.password).not.toBe(userData.password);
    });

    it('should pass correct user data to prisma create', async () => {
      // Arrange
      const userData = {
        email: 'precise@example.com',
        name: 'Precise Name',
        password: 'password',
      };
      const hashedPassword = 'hashed';

      (bcryptService.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prismaService.users.create as jest.Mock).mockResolvedValue(
        createMockUser(),
      );

      // Act
      await repository.register(userData);

      // Assert
      expect(prismaService.users.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        },
      });
    });

    it('should hash password before creating user', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test',
        password: 'password123',
      };
      const hashedPassword = 'hashed_pwd';

      (bcryptService.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prismaService.users.create as jest.Mock).mockResolvedValue(
        createMockUser(),
      );

      // Act
      await repository.register(userData);

      // Assert
      expect(bcryptService.hash).toHaveBeenCalled();
      expect(prismaService.users.create).toHaveBeenCalled();
    });
  });

  describe('updateLastLogin', () => {
    it('should throw error as method is not implemented', () => {
      // Act & Assert
      expect(() => repository.updateLastLogin()).toThrow(
        'Method not implemented.',
      );
    });
  });
});
