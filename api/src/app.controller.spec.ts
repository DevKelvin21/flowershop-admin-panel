import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: { getHealth: jest.Mock };

  beforeEach(async () => {
    appService = {
      getHealth: jest.fn().mockResolvedValue({
        status: 'ok',
        database: 'connected',
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return health payload from AppService', async () => {
      await expect(appController.getHealth()).resolves.toEqual({
        status: 'ok',
        database: 'connected',
      });
      expect(appService.getHealth).toHaveBeenCalledTimes(1);
    });
  });
});
