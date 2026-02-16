import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller({ path: '', version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('/health')
  @ApiOperation({
    summary: 'Get health status',
    description: 'Health status indicator - No authentication required',
  })
  @ApiResponse({
    status: 200,
    description: 'Health status indicator',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-12-03T12:00:00.000Z',
        database: 'connected',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getHealth(): Promise<object> {
    return await this.appService.getHealth();
  }
}
