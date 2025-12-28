# Test Documentation

## Overview

This document provides a comprehensive overview of the automated test suite created for the NestJS Clean Architecture project.

## Test Coverage Summary

### 1. Domain Layer Tests

**File:** [`src/domain/model/user.spec.ts`](src/domain/model/user.spec.ts)

**What is tested:**

- User entity creation and property assignment
- UserM entity (extends User with password field)
- Inheritance relationship between User and UserM

**Key test cases:**

- Creating User instances with all properties
- Partial property assignment
- UserM extends User correctly
- Password property in UserM

**Notes:**

- Pure domain logic testing
- No external dependencies or mocks
- No NestJS imports (follows Clean Architecture)

---

### 2. Use Case Layer Tests

#### 2.1 RegisterUseCases

**File:** [`src/usecases/auth/register.usecases.spec.ts`](src/usecases/auth/register.usecases.spec.ts)

**What is tested:**

- User registration business logic
- Email uniqueness validation
- Error handling for duplicate emails

**Mocked dependencies:**

- `UserRepositoryI` - User data access
- `ExceptionsService` - Exception handling

**Key test cases:**

- Successfully register new user when email doesn't exist
- Throw BadRequestException when email already exists
- Check user existence before registration
- Pass exact user data to repository

**Notes:**

- Tests business logic in isolation
- No infrastructure dependencies
- Follows Arrange/Act/Assert pattern

---

#### 2.2 LoginUseCases

**File:** [`src/usecases/auth/login.usecases.spec.ts`](src/usecases/auth/login.usecases.spec.ts)

**What is tested:**

- JWT token generation for authentication
- Refresh token generation and storage
- User validation for local and JWT strategies
- Refresh token matching

**Mocked dependencies:**

- `ILogger` - Logging service
- `IJwtService` - JWT token operations
- `JWTConfig` - JWT configuration
- `UserRepositoryI` - User data access
- `IBcryptService` - Password hashing/comparison

**Key test cases:**

- Generate JWT token cookie with correct format
- Generate refresh token and update user
- Validate user with correct credentials
- Return null for invalid credentials
- Return null for non-existent users
- Validate refresh token matches

**Notes:**

- Comprehensive authentication flow testing
- All external dependencies mocked
- Tests both success and failure paths

---

#### 2.3 CreateTransactionUsecase

**File:** [`src/usecases/transactions/create-transaction.usecases.spec.ts`](src/usecases/transactions/create-transaction.usecases.spec.ts)

**What is tested:**

- Transaction creation business logic
- Different transaction types (income/expense)
- Different transaction statuses (active/inactive/pending)
- Logging after transaction creation

**Mocked dependencies:**

- `ILogger` - Logging service
- `TransactionRepositoryI` - Transaction data access

**Key test cases:**

- Successfully create transaction and log action
- Create income transaction with correct data
- Create expense transaction with correct data
- Handle different transaction statuses
- Return null when repository returns null
- Pass exact transaction data to repository

**Notes:**

- Tests use Prisma Decimal type for amounts
- Covers all transaction types and statuses
- Verifies data integrity

---

### 3. Infrastructure Layer Tests

#### 3.1 DatabaseUserRepository

**File:** [`src/infrastructure/repositories/user.repository.spec.ts`](src/infrastructure/repositories/user.repository.spec.ts)

**What is tested:**

- User repository implementation
- Database operations (CRUD)
- Password hashing during registration
- Refresh token updates

**Mocked dependencies:**

- `PrismaService` - Database client
- `BcryptService` - Password hashing

**Key test cases:**

- Return user when found by email
- Return null when user not found
- Handle database errors gracefully
- Update user refresh token
- Hash password before creating user
- Pass correct data to Prisma create
- Throw error for unimplemented updateLastLogin

**Notes:**

- Uses @nestjs/testing for dependency injection
- Mocks Prisma client to avoid real database calls
- Tests data mapping and error handling

---

#### 3.2 AuthController

**File:** [`src/infrastructure/controllers/auth/auth.controller.spec.ts`](src/infrastructure/controllers/auth/auth.controller.spec.ts)

**What is tested:**

- HTTP request/response handling
- Authentication endpoints
- Cookie management
- Request to response mapping

**Mocked dependencies:**

- `LoginUseCases` - Login business logic
- `LogoutUseCases` - Logout business logic
- `RegisterUseCases` - Registration business logic
- `IsAuthenticatedUseCases` - Authentication check logic

**Key test cases:**

- **Login:** Set authentication cookies and return success
- **Logout:** Clear cookies and return success
- **IsAuthenticated:** Return user email when authenticated
- **Refresh:** Refresh access token and set cookie
- **Register:** Register user and set authentication cookies

**Notes:**

- Uses @nestjs/testing for controller testing
- Mocks all use case dependencies
- Tests HTTP layer without business logic
- Verifies cookie setting and response messages

---

## Test Execution

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm run test:cov
```

### Run specific test file

```bash
npm test -- user.spec.ts
```

---

## Test Structure

All tests follow this structure:

```typescript
describe('ComponentName', () => {
  // Setup
  let component: ComponentType;
  let mockDependency: jest.Mocked<DependencyType>;

  beforeEach(() => {
    // Initialize mocks and component
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange - Setup test data and mocks
      
      // Act - Execute the method
      
      // Assert - Verify the results
    });
  });
});
```

---

## Testing Principles Applied

1. **Arrange/Act/Assert Pattern:** All tests follow AAA pattern for clarity
2. **Isolation:** Each test is independent and doesn't affect others
3. **Mocking:** External dependencies are mocked to test in isolation
4. **Clear Naming:** Test names describe what is being tested
5. **Factory Functions:** `createMockUser()`, `createMockTransaction()` for test data
6. **No Magic Numbers:** Use meaningful constants and variables
7. **Edge Cases:** Tests cover success paths, failures, and edge cases

---

## Clean Architecture Compliance

### Domain Layer

- ✅ No NestJS imports
- ✅ Pure TypeScript classes
- ✅ No external dependencies
- ✅ Tests focus on entity behavior

### Use Case Layer

- ✅ Depends only on domain abstractions (interfaces)
- ✅ No infrastructure imports
- ✅ All dependencies mocked via interfaces
- ✅ Tests business logic in isolation

### Infrastructure Layer

- ✅ Uses @nestjs/testing for DI
- ✅ Mocks external services (database, APIs)
- ✅ Tests data mapping and error handling
- ✅ Verifies integration with NestJS framework

---

## Coverage Goals

- **Domain Layer:** 100% (simple entities)
- **Use Case Layer:** 90%+ (business logic)
- **Infrastructure Layer:** 80%+ (integration points)

---

## Future Test Additions

Consider adding tests for:

1. Transaction update and delete use cases
2. Transaction repository implementation
3. Transactions controller
4. JWT and Bcrypt service implementations
5. Exception service
6. Logger service
7. E2E tests for complete user flows

---

## Common Issues and Solutions

### Issue: ESLint warnings about unbound methods

**Solution:** These are common in Jest tests and don't affect functionality. Can be ignored or disabled for test files.

### Issue: Prisma type errors in mocks

**Solution:** Use type assertions `as jest.Mock` when mocking Prisma methods.

### Issue: Async test timeouts

**Solution:** Ensure all async operations use `await` and promises are properly resolved.

---

## Test Maintenance

- Keep tests updated when business logic changes
- Add tests for new features before implementation (TDD)
- Refactor tests when code is refactored
- Remove obsolete tests when features are removed
- Keep mock data factories up to date with schema changes

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Testing Best Practices](https://testingjavascript.com/)
