import { User, UserM } from './user';

describe('User Domain Model', () => {
  describe('User', () => {
    it('should create a User instance with all properties', () => {
      // Arrange
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        createDate: new Date('2024-01-01'),
        updatedDate: new Date('2024-01-02'),
        hashRefreshToken: 'hashed_token_123',
      };

      // Act
      const user = new User();
      Object.assign(user, userData);

      // Assert
      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.createDate).toEqual(userData.createDate);
      expect(user.updatedDate).toEqual(userData.updatedDate);
      expect(user.hashRefreshToken).toBe(userData.hashRefreshToken);
    });

    it('should allow partial assignment of properties', () => {
      // Arrange & Act
      const user = new User();
      user.id = '123';
      user.email = 'partial@example.com';

      // Assert
      expect(user.id).toBe('123');
      expect(user.email).toBe('partial@example.com');
      expect(user.name).toBeUndefined();
    });
  });

  describe('UserM', () => {
    it('should extend User and include password property', () => {
      // Arrange
      const userMData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        createDate: new Date('2024-01-01'),
        updatedDate: new Date('2024-01-02'),
        hashRefreshToken: 'hashed_token_123',
        password: 'hashed_password_123',
      };

      // Act
      const userM = new UserM();
      Object.assign(userM, userMData);

      // Assert
      expect(userM.id).toBe(userMData.id);
      expect(userM.email).toBe(userMData.email);
      expect(userM.name).toBe(userMData.name);
      expect(userM.password).toBe(userMData.password);
      expect(userM.createDate).toEqual(userMData.createDate);
      expect(userM.updatedDate).toEqual(userMData.updatedDate);
      expect(userM.hashRefreshToken).toBe(userMData.hashRefreshToken);
    });

    it('should be an instance of User', () => {
      // Arrange & Act
      const userM = new UserM();

      // Assert
      expect(userM).toBeInstanceOf(User);
      expect(userM).toBeInstanceOf(UserM);
    });

    it('should allow setting password independently', () => {
      // Arrange & Act
      const userM = new UserM();
      userM.email = 'test@example.com';
      userM.password = 'secure_password';

      // Assert
      expect(userM.email).toBe('test@example.com');
      expect(userM.password).toBe('secure_password');
    });
  });
});
