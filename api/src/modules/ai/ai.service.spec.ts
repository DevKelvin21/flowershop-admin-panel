import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;
  let prisma: { inventory: { findMany: jest.Mock } };
  const originalOpenAiKey = process.env.OPENAI_API_KEY;

  beforeEach(async () => {
    delete process.env.OPENAI_API_KEY;

    prisma = {
      inventory: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    if (originalOpenAiKey) {
      process.env.OPENAI_API_KEY = originalOpenAiKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it('uses fallback parser when OpenAI is unavailable', async () => {
    prisma.inventory.findMany.mockResolvedValue([
      {
        id: 'inv-1',
        item: 'Rosas',
        quality: 'Premium',
        quantity: 50,
        unitPrice: { toString: () => '2.5' },
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const result = await service.parseTransaction(
      '2 rosas premium total $10 transferencia mila',
      'es',
    );

    expect(result.paymentMethod).toBe('BANK_TRANSFER');
    expect(result.salesAgent).toBe('mila');
    expect(result.totalAmount).toBe(10);
    expect(result.items.length).toBe(1);
    expect(result.items[0].inventoryId).toBe('inv-1');
    expect(result.rawAiResponse.startsWith('FALLBACK_PARSER')).toBe(true);
  });

  it('throws when inventory is empty', async () => {
    prisma.inventory.findMany.mockResolvedValue([]);

    await expect(
      service.parseTransaction('1 rosa total $2 mila', 'es'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
