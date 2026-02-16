import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ParseTransactionResponseDto,
  ParsedItemDto,
} from './dto/parse-transaction-response.dto';
import { TransactionType, PaymentMethod } from '@prisma/client';

interface InventoryContextItem {
  id: string;
  item: string;
  quality: string;
  quantity: number;
  unitPrice: { toString(): string };
}

interface AiParsedResult {
  type: 'SALE' | 'EXPENSE';
  salesAgent?: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  notes?: string;
  items: Array<{ itemName: string; quality?: string; quantity: number }>;
  totalAmount: number;
  confidence: number;
  suggestions?: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not set - AI features disabled');
    }
  }

  async parseTransaction(
    prompt: string,
    language: 'es' | 'en' = 'es',
  ): Promise<ParseTransactionResponseDto> {
    if (!this.openai) {
      throw new ServiceUnavailableException(
        'AI service not configured. Set OPENAI_API_KEY environment variable.',
      );
    }

    const startTime = Date.now();

    // Fetch current active inventory for context
    const inventory: InventoryContextItem[] =
      await this.prisma.inventory.findMany({
        where: { isActive: true },
        orderBy: { item: 'asc' },
      });

    if (inventory.length === 0) {
      throw new BadRequestException(
        'No hay artículos activos en inventario. Agrega inventario antes de usar el análisis con IA.',
      );
    }

    // Build system prompt with inventory context
    const systemPrompt = this.buildSystemPrompt(inventory, language);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const rawResponse = completion.choices[0]?.message?.content || '';
      const processingTimeMs = Date.now() - startTime;

      // Parse AI response
      let parsed: AiParsedResult;
      try {
        const rawParsed: unknown = JSON.parse(rawResponse);
        if (!this.isAiParsedResult(rawParsed)) {
          throw new Error('Invalid AI response shape');
        }
        parsed = rawParsed;
      } catch {
        this.logger.error(`Failed to parse AI response: ${rawResponse}`);
        throw new BadRequestException(
          'La IA devolvió una respuesta inválida. Intenta reformular tu entrada.',
        );
      }

      // Match parsed items to inventory and build response
      const matchedItems = this.matchItemsToInventory(parsed.items, inventory);

      return {
        type: parsed.type as TransactionType,
        salesAgent: parsed.salesAgent,
        paymentMethod: (parsed.paymentMethod || 'CASH') as PaymentMethod,
        notes: parsed.notes,
        items: matchedItems,
        totalAmount: parsed.totalAmount,
        confidence: parsed.confidence,
        suggestions: parsed.suggestions,
        processingTimeMs,
        originalPrompt: prompt,
        rawAiResponse: rawResponse,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      this.logger.error('OpenAI API error:', error);
      throw new ServiceUnavailableException(
        'Servicio de IA temporalmente no disponible. Intenta de nuevo o ingresa la transacción manualmente.',
      );
    }
  }

  private buildSystemPrompt(
    inventory: InventoryContextItem[],
    language: 'es' | 'en',
  ): string {
    const inventoryList = inventory
      .map(
        (item) =>
          `- ${item.item} (${item.quality}): $${String(item.unitPrice)}/unidad, ${item.quantity} disponibles [ID: ${item.id}]`,
      )
      .join('\n');

    const spanishPrompt = `Eres un asistente de ventas para una floristería. Tu tarea es parsear entradas en lenguaje natural a datos estructurados de transacción.

FORMATO DE ENTRADA TÍPICO:
"[cantidad] [productos] total $[monto] [método_pago?] [nombre_agente]"

Ejemplos:
- "1 ramo 12 rosas perlas y mariposas total $20.00 transferencia mila"
- "1 chasta total $4.00 mila"
- "2 docenas rosas rojas total $15.00 efectivo juan"

INVENTARIO DISPONIBLE:
${inventoryList}

REGLAS:
1. Tipo de transacción: Siempre es SALE (venta) a menos que se indique explícitamente como gasto/compra
2. Método de pago:
   - "transferencia" o "transfer" = BANK_TRANSFER
   - Cualquier otra cosa o no especificado = CASH (efectivo es el default)
3. Nombre del agente de ventas: La ÚLTIMA palabra del prompt es generalmente el nombre del vendedor
4. Total: Extrae el monto de "$X.XX" o "total X"
5. Productos: Haz coincidencia aproximada con el inventario (rosas → Rosas, rosa → Rosas)
6. Confianza (0-1):
   - 1.0: Coincidencia perfecta, sin ambigüedad
   - 0.8-0.99: Alta coincidencia con suposiciones menores
   - 0.5-0.79: Algo de ambigüedad
   - <0.5: Baja confianza, agrega sugerencias

RESPONDE ÚNICAMENTE con JSON válido en este formato:
{
  "type": "SALE",
  "salesAgent": string | null,
  "paymentMethod": "CASH" | "BANK_TRANSFER",
  "notes": string | null,
  "items": [
    { "itemName": string, "quality": string | null, "quantity": number }
  ],
  "totalAmount": number,
  "confidence": number,
  "suggestions": string[] | null
}

IMPORTANTE:
- El nombre del agente está al FINAL del prompt
- Si no puedes identificar productos específicos, deja items vacío y baja la confianza
- El totalAmount debe ser el número extraído del prompt, no calculado`;

    const englishPrompt = `You are a sales assistant for a flower shop. Parse natural language input into structured transaction data.

TYPICAL INPUT FORMAT:
"[quantity] [products] total $[amount] [payment_method?] [agent_name]"

Examples:
- "1 bouquet 12 roses pearls and butterflies total $20.00 transfer mila"
- "1 chasta total $4.00 mila"

AVAILABLE INVENTORY:
${inventoryList}

RULES:
1. Transaction type: Always SALE unless explicitly indicated as expense/purchase
2. Payment method:
   - "transfer" or "transferencia" = BANK_TRANSFER
   - Anything else or not specified = CASH (default)
3. Sales agent name: The LAST word in the prompt is usually the sales agent name
4. Total: Extract amount from "$X.XX" or "total X"
5. Products: Fuzzy match with inventory
6. Confidence (0-1): Self-evaluate parsing accuracy

RESPOND ONLY with valid JSON:
{
  "type": "SALE",
  "salesAgent": string | null,
  "paymentMethod": "CASH" | "BANK_TRANSFER",
  "notes": string | null,
  "items": [
    { "itemName": string, "quality": string | null, "quantity": number }
  ],
  "totalAmount": number,
  "confidence": number,
  "suggestions": string[] | null
}`;

    return language === 'es' ? spanishPrompt : englishPrompt;
  }

  private matchItemsToInventory(
    parsedItems: Array<{
      itemName: string;
      quality?: string;
      quantity: number;
    }>,
    inventory: InventoryContextItem[],
  ): ParsedItemDto[] {
    const matchedItems: ParsedItemDto[] = [];

    for (const parsed of parsedItems) {
      // Find best matching inventory item (case-insensitive, fuzzy match)
      const normalizedName = parsed.itemName.toLowerCase().trim();

      let bestMatch = inventory.find(
        (inv) =>
          inv.item.toLowerCase() === normalizedName ||
          inv.item.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(inv.item.toLowerCase()),
      );

      // If quality specified, try to find exact quality match
      if (bestMatch && parsed.quality) {
        const qualityMatch = inventory.find(
          (inv) =>
            (inv.item.toLowerCase() === normalizedName ||
              inv.item.toLowerCase().includes(normalizedName) ||
              normalizedName.includes(inv.item.toLowerCase())) &&
            inv.quality.toLowerCase() === parsed.quality!.toLowerCase(),
        );
        if (qualityMatch) bestMatch = qualityMatch;
      }

      if (bestMatch) {
        matchedItems.push({
          inventoryId: bestMatch.id,
          itemName: bestMatch.item,
          quality: bestMatch.quality,
          quantity: parsed.quantity,
          unitPrice: Number(bestMatch.unitPrice),
          availableQuantity: bestMatch.quantity,
        });
      }
    }

    return matchedItems;
  }

  private isAiParsedResult(value: unknown): value is AiParsedResult {
    if (typeof value !== 'object' || value === null) return false;

    const candidate = value as Partial<AiParsedResult>;
    const hasValidType =
      candidate.type === 'SALE' || candidate.type === 'EXPENSE';
    const hasValidTotal = typeof candidate.totalAmount === 'number';
    const hasValidConfidence = typeof candidate.confidence === 'number';
    const hasValidItems =
      Array.isArray(candidate.items) &&
      candidate.items.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as { itemName?: unknown }).itemName === 'string' &&
          typeof (item as { quantity?: unknown }).quantity === 'number',
      );

    return hasValidType && hasValidTotal && hasValidConfidence && hasValidItems;
  }
}
