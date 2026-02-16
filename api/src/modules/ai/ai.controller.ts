import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ParseTransactionDto } from './dto/parse-transaction.dto';
import { ParseTransactionResponseDto } from './dto/parse-transaction-response.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-transaction')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Parse natural language into structured transaction',
    description: `Parses natural language input into a structured transaction format.

**Input Format**: \`[cantidad] [productos] total $[monto] [método_pago?] [nombre_agente]\`

**Examples**:
- \`"1 ramo 12 rosas perlas total $20.00 transferencia mila"\`
- \`"1 chasta total $4.00 mila"\`

**Returns**: Parsed transaction with matched inventory items, payment method, sales agent, and confidence score.

**Note**: This endpoint does NOT create the transaction. Use POST /transactions to create it after reviewing the parsed data.`,
  })
  @ApiResponse({
    status: 200,
    description:
      'Transaction parsed successfully (OpenAI primary parser or fallback parser)',
    type: ParseTransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid prompt or unable to parse',
  })
  @ApiResponse({
    status: 503,
    description:
      'AI parsing unavailable (both OpenAI and fallback parser failed unexpectedly)',
  })
  async parseTransaction(
    @Body() dto: ParseTransactionDto,
  ): Promise<ParseTransactionResponseDto> {
    return this.aiService.parseTransaction(dto.prompt, dto.language || 'es');
  }
}
