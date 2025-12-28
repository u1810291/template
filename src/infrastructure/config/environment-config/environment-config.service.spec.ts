import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfigService } from './environment-config.service';

describe('EnvironmentConfigService', () => {
  let service: EnvironmentConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvironmentConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
                JWT_SECRET: 'test-secret',
                JWT_EXPIRATION_TIME: '3600s',
                JWT_REFRESH_TOKEN_SECRET: 'test-refresh-secret',
                JWT_REFRESH_TOKEN_EXPIRATION_TIME: '86400s',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EnvironmentConfigService>(EnvironmentConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return database URL', () => {
    expect(service.getDatabaseUrl()).toBe(
      'postgresql://test:test@localhost:5432/test',
    );
  });

  it('should return JWT secret', () => {
    expect(service.getJwtSecret()).toBe('test-secret');
  });

  it('should return JWT expiration time', () => {
    expect(service.getJwtExpirationTime()).toBe('3600s');
  });

  it('should return JWT refresh secret', () => {
    expect(service.getJwtRefreshSecret()).toBe('test-refresh-secret');
  });

  it('should return JWT refresh expiration time', () => {
    expect(service.getJwtRefreshExpirationTime()).toBe('86400s');
  });
});
