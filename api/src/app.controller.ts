import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller({ path: '', version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get health status', description: 'Health status indicator' })
  @ApiResponse({
    status: 200,
    description: 'Health status indicator',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiTags('Health')
  @Get("/health")
  async getHealth(): Promise<string> {
    return await this.appService.getHealth();
  }
}
