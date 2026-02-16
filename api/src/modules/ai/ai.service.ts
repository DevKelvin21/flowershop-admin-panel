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
  updatedAt: Date;
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

interface CachedParseEntry {
  expiresAt: number;
  response: ParseTransactionResponseDto;
}

@Injectable()
export class AiService {
  private static readonly DEFAULT_TIMEOUT_MS = 12000;
  private static readonly DEFAULT_RETRY_ATTEMPTS = 1;
  private static readonly DEFAULT_MAX_PROMPT_CHARS = 600;
  private static readonly DEFAULT_MAX_RESPONSE_TOKENS = 320;
  private static readonly DEFAULT_MAX_CONTEXT_ITEMS = 40;
  private static readonly DEFAULT_CACHE_TTL_MS = 60000;
  private static readonly MAX_CACHE_ENTRIES = 200;
  private static readonly AGENT_STOPWORDS = new Set([
    'total',
    'tot',
    'efectivo',
    'transferencia',
    'transfer',
    'cash',
    'bank',
    'banco',
    'compra',
    'gasto',
    'expense',
    'sale',
    'venta',
    'con',
    'sin',
    'para',
    'por',
    'de',
    'del',
    'la',
    'el',
    'los',
    'las',
    'un',
    'una',
    'y',
  ]);

  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;
  private readonly openAiTimeoutMs: number;
  private readonly retryAttempts: number;
  private readonly maxPromptChars: number;
  private readonly maxResponseTokens: number;
  private readonly maxContextItems: number;
  private readonly cacheTtlMs: number;
  private readonly responseCache = new Map<string, CachedParseEntry>();
  private readonly inFlightParses = new Map<
    string,
    Promise<ParseTransactionResponseDto>
  >();

  constructor(private readonly prisma: PrismaService) {
    this.openAiTimeoutMs = this.readEnvNumber(
      'AI_TIMEOUT_MS',
      AiService.DEFAULT_TIMEOUT_MS,
    );
    this.retryAttempts = this.readEnvNumber(
      'AI_RETRY_ATTEMPTS',
      AiService.DEFAULT_RETRY_ATTEMPTS,
    );
    this.maxPromptChars = this.readEnvNumber(
      'AI_MAX_PROMPT_CHARS',
      AiService.DEFAULT_MAX_PROMPT_CHARS,
    );
    this.maxResponseTokens = this.readEnvNumber(
      'AI_MAX_RESPONSE_TOKENS',
      AiService.DEFAULT_MAX_RESPONSE_TOKENS,
    );
    this.maxContextItems = this.readEnvNumber(
      'AI_MAX_CONTEXT_ITEMS',
      AiService.DEFAULT_MAX_CONTEXT_ITEMS,
    );
    this.cacheTtlMs = this.readEnvNumber(
      'AI_CACHE_TTL_MS',
      AiService.DEFAULT_CACHE_TTL_MS,
    );

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        maxRetries: 0,
        timeout: this.openAiTimeoutMs,
      });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn(
        'OPENAI_API_KEY not set - using fallback parser only for AI endpoint',
      );
    }
  }

  async parseTransaction(
    prompt: string,
    language: 'es' | 'en' = 'es',
  ): Promise<ParseTransactionResponseDto> {
    const normalizedPrompt = this.normalizePrompt(prompt);
    if (!normalizedPrompt) {
      throw new BadRequestException('El prompt no puede estar vacío');
    }

    // Fetch current active inventory for context
    const inventory: InventoryContextItem[] =
      await this.prisma.inventory.findMany({
        where: { isActive: true },
        orderBy: { item: 'asc' },
        select: {
          id: true,
          item: true,
          quality: true,
          quantity: true,
          unitPrice: true,
          updatedAt: true,
        },
      });

    if (inventory.length === 0) {
      throw new BadRequestException(
        'No hay artículos activos en inventario. Agrega inventario antes de usar el análisis con IA.',
      );
    }

    const limitedPrompt = normalizedPrompt.slice(0, this.maxPromptChars);
    const contextInventory = this.selectInventoryContext(
      limitedPrompt,
      inventory,
    );
    const cacheKey = this.buildCacheKey(limitedPrompt, language, inventory);
    this.cleanupCaches();

    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    const inFlight = this.inFlightParses.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    const parsePromise = this.executeParse({
      prompt: limitedPrompt,
      language,
      inventory,
      contextInventory,
      startTime: Date.now(),
    })
      .then((response) => {
        this.setCachedResponse(cacheKey, response);
        return response;
      })
      .finally(() => {
        this.inFlightParses.delete(cacheKey);
      });

    this.inFlightParses.set(cacheKey, parsePromise);
    return parsePromise;
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

    const spanishPrompt = `Eres un asistente de ventas para una floristería. Convierte texto libre a JSON de transacción.

Entrada típica:
"[cantidad] [productos] total $[monto] [método_pago?] [nombre_agente]"

Inventario disponible:
${inventoryList}

Reglas:
1. type: SALE por defecto (EXPENSE solo si el texto lo indica explícitamente).
2. paymentMethod: BANK_TRANSFER solo para transferencia/transfer; en otro caso CASH.
3. salesAgent: normalmente la última palabra del prompt.
4. totalAmount: extraer del texto (ej: "$20", "total 20").
5. items: hacer coincidencia aproximada con inventario.
6. confidence entre 0 y 1.
7. Si hay ambigüedad, agrega suggestions.

Responde únicamente JSON válido:
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
No incluyas texto adicional fuera del JSON.`;

    const englishPrompt = `You are a flower-shop sales assistant. Convert free text to transaction JSON.

Typical input:
"[quantity] [products] total $[amount] [payment_method?] [agent_name]"

Available inventory:
${inventoryList}

Rules:
1. type defaults to SALE unless expense/purchase is explicit.
2. paymentMethod: BANK_TRANSFER only for transfer keywords, otherwise CASH.
3. salesAgent is usually the final word.
4. Extract totalAmount from prompt text.
5. Fuzzy match items to inventory.
6. confidence is between 0 and 1.
7. Add suggestions when uncertain.

Respond with JSON only:
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
No extra prose.`;

    return language === 'es' ? spanishPrompt : englishPrompt;
  }

  private async executeParse(input: {
    prompt: string;
    language: 'es' | 'en';
    inventory: InventoryContextItem[];
    contextInventory: InventoryContextItem[];
    startTime: number;
  }): Promise<ParseTransactionResponseDto> {
    const { prompt, language, inventory, contextInventory, startTime } = input;

    if (!this.openai) {
      return this.buildFallbackResponse(
        prompt,
        inventory,
        startTime,
        'OPENAI_UNAVAILABLE',
      );
    }

    const systemPrompt = this.buildSystemPrompt(contextInventory, language);

    try {
      const completion = await this.requestOpenAiCompletion(
        systemPrompt,
        prompt,
      );
      const rawResponse = completion.choices[0]?.message?.content || '';
      const parsed = this.parseOpenAiResponse(rawResponse);

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
        processingTimeMs: Date.now() - startTime,
        originalPrompt: prompt,
        rawAiResponse: rawResponse,
      };
    } catch (error) {
      this.logger.warn(
        `OpenAI parse failed, using fallback parser: ${this.summarizeError(error)}`,
      );
      return this.buildFallbackResponse(prompt, inventory, startTime, error);
    }
  }

  private async requestOpenAiCompletion(
    systemPrompt: string,
    userPrompt: string,
  ) {
    if (!this.openai) {
      throw new ServiceUnavailableException('OpenAI client not configured');
    }

    for (let attempt = 0; attempt <= this.retryAttempts; attempt += 1) {
      try {
        return await this.openai.chat.completions.create(
          {
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.2,
            max_tokens: this.maxResponseTokens,
            response_format: { type: 'json_object' },
          },
          { timeout: this.openAiTimeoutMs },
        );
      } catch (error) {
        const canRetry =
          attempt < this.retryAttempts && this.isTransientOpenAiError(error);
        if (!canRetry) {
          throw error;
        }

        const backoffMs = 250 * (attempt + 1);
        this.logger.warn(
          `Transient OpenAI error on attempt ${attempt + 1}/${
            this.retryAttempts + 1
          }: ${this.summarizeError(error)}. Retrying in ${backoffMs}ms`,
        );
        await this.sleep(backoffMs);
      }
    }

    throw new ServiceUnavailableException(
      'No se pudo completar la solicitud a OpenAI.',
    );
  }

  private parseOpenAiResponse(rawResponse: string): AiParsedResult {
    try {
      const rawParsed: unknown = JSON.parse(rawResponse);
      if (!this.isAiParsedResult(rawParsed)) {
        throw new Error('Invalid AI response shape');
      }
      return rawParsed;
    } catch {
      this.logger.error(`Failed to parse AI response: ${rawResponse}`);
      throw new BadRequestException(
        'La IA devolvió una respuesta inválida. Intenta reformular tu entrada.',
      );
    }
  }

  private buildFallbackResponse(
    prompt: string,
    inventory: InventoryContextItem[],
    startTime: number,
    sourceError: unknown,
  ): ParseTransactionResponseDto {
    const parsedItems = this.extractItemsFromPrompt(prompt, inventory);
    const extractedTotal = this.extractTotalAmount(prompt);
    const inferredTotal = parsedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const totalAmount =
      extractedTotal > 0 ? extractedTotal : Number(inferredTotal.toFixed(2));

    const transactionType = this.extractTransactionType(prompt);
    const paymentMethod = this.extractPaymentMethod(prompt);
    const salesAgent = this.extractSalesAgent(prompt);
    const confidence = this.calculateFallbackConfidence({
      prompt,
      items: parsedItems,
      totalAmount,
      salesAgent,
      paymentMethod,
    });
    const suggestions = this.buildFallbackSuggestions({
      items: parsedItems,
      totalAmount,
      salesAgent,
      confidence,
      hadExplicitTotal: extractedTotal > 0,
    });

    return {
      type: transactionType,
      salesAgent: salesAgent || undefined,
      paymentMethod,
      notes:
        'Resultado generado por parser de respaldo. Verifica antes de guardar.',
      items: parsedItems,
      totalAmount,
      confidence,
      suggestions,
      processingTimeMs: Date.now() - startTime,
      originalPrompt: prompt,
      rawAiResponse: `FALLBACK_PARSER:${this.summarizeError(sourceError)}`,
    };
  }

  private extractItemsFromPrompt(
    prompt: string,
    inventory: InventoryContextItem[],
  ): ParsedItemDto[] {
    const normalizedPrompt = this.normalizeText(prompt);
    const items: ParsedItemDto[] = [];
    const seenIds = new Set<string>();

    for (const inventoryItem of inventory) {
      const normalizedItemName = this.normalizeText(inventoryItem.item);
      const itemTokens = normalizedItemName
        .split(' ')
        .map((token) => token.trim())
        .filter((token) => token.length >= 3);

      const hasItemMatch =
        itemTokens.length > 0 &&
        itemTokens.every((token) =>
          this.promptHasToken(normalizedPrompt, token),
        );

      if (!hasItemMatch || seenIds.has(inventoryItem.id)) {
        continue;
      }

      const quantity = this.extractQuantityForItem(
        normalizedPrompt,
        normalizedItemName,
      );
      items.push({
        inventoryId: inventoryItem.id,
        itemName: inventoryItem.item,
        quality: inventoryItem.quality,
        quantity,
        unitPrice: Number(inventoryItem.unitPrice),
        availableQuantity: inventoryItem.quantity,
      });
      seenIds.add(inventoryItem.id);
    }

    return items.slice(0, 8);
  }

  private extractQuantityForItem(
    normalizedPrompt: string,
    normalizedItemName: string,
  ): number {
    const escapedName = this.escapeRegex(normalizedItemName);
    const beforePattern = new RegExp(
      `(\\d{1,3})\\s*(?:x\\s*)?${escapedName}\\b`,
      'i',
    );
    const afterPattern = new RegExp(
      `${escapedName}\\s*(?:x\\s*)?(\\d{1,3})\\b`,
      'i',
    );

    const beforeMatch = normalizedPrompt.match(beforePattern);
    if (beforeMatch?.[1]) {
      return Math.max(1, Number.parseInt(beforeMatch[1], 10));
    }

    const afterMatch = normalizedPrompt.match(afterPattern);
    if (afterMatch?.[1]) {
      return Math.max(1, Number.parseInt(afterMatch[1], 10));
    }

    return 1;
  }

  private extractTotalAmount(prompt: string): number {
    const normalizedPrompt = this.normalizeText(prompt);
    const totalPattern = /(?:total|tot)\s*\$?\s*(\d+(?:[.,]\d{1,2})?)/i;
    const moneyPattern = /\$\s*(\d+(?:[.,]\d{1,2})?)/i;

    const totalMatch = normalizedPrompt.match(totalPattern);
    if (totalMatch?.[1]) {
      return this.parseAmount(totalMatch[1]);
    }

    const moneyMatch = normalizedPrompt.match(moneyPattern);
    if (moneyMatch?.[1]) {
      return this.parseAmount(moneyMatch[1]);
    }

    return 0;
  }

  private extractPaymentMethod(prompt: string): PaymentMethod {
    const normalizedPrompt = this.normalizeText(prompt);
    if (
      normalizedPrompt.includes('transferencia') ||
      normalizedPrompt.includes('transfer') ||
      normalizedPrompt.includes('nequi') ||
      normalizedPrompt.includes('daviplata') ||
      normalizedPrompt.includes('banco') ||
      normalizedPrompt.includes('bank')
    ) {
      return 'BANK_TRANSFER';
    }
    return 'CASH';
  }

  private extractTransactionType(prompt: string): TransactionType {
    const normalizedPrompt = this.normalizeText(prompt);
    if (
      normalizedPrompt.includes('gasto') ||
      normalizedPrompt.includes('compra') ||
      normalizedPrompt.includes('expense') ||
      normalizedPrompt.includes('purchase') ||
      normalizedPrompt.includes('proveedor')
    ) {
      return 'EXPENSE';
    }
    return 'SALE';
  }

  private extractSalesAgent(prompt: string): string | null {
    const tokens = this.normalizeText(prompt)
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length > 1);

    for (let index = tokens.length - 1; index >= 0; index -= 1) {
      const candidate = tokens[index];
      if (
        AiService.AGENT_STOPWORDS.has(candidate) ||
        /^\d+$/.test(candidate) ||
        candidate.includes('$')
      ) {
        continue;
      }
      return candidate;
    }

    return null;
  }

  private calculateFallbackConfidence(input: {
    prompt: string;
    items: ParsedItemDto[];
    totalAmount: number;
    salesAgent: string | null;
    paymentMethod: PaymentMethod;
  }): number {
    const { prompt, items, totalAmount, salesAgent, paymentMethod } = input;
    let confidence = 0.2;

    if (items.length > 0) confidence += 0.25;
    if (totalAmount > 0) confidence += 0.2;
    if (salesAgent) confidence += 0.1;
    if (
      paymentMethod === 'BANK_TRANSFER' &&
      this.normalizeText(prompt).includes('transfer')
    ) {
      confidence += 0.1;
    }
    if (items.every((item) => item.quantity <= item.availableQuantity)) {
      confidence += 0.05;
    }

    return Math.min(0.75, Number(confidence.toFixed(2)));
  }

  private buildFallbackSuggestions(input: {
    items: ParsedItemDto[];
    totalAmount: number;
    salesAgent: string | null;
    confidence: number;
    hadExplicitTotal: boolean;
  }): string[] | undefined {
    const suggestions: string[] = [];

    if (input.items.length === 0) {
      suggestions.push(
        'No pude identificar artículos del inventario. Especifica nombre y cantidad por producto.',
      );
    }
    if (input.totalAmount <= 0) {
      suggestions.push(
        'No pude extraer el total. Indica "total $X" en la descripción.',
      );
    } else if (!input.hadExplicitTotal) {
      suggestions.push(
        'El total fue inferido desde precios unitarios del inventario. Verifícalo antes de guardar.',
      );
    }
    if (!input.salesAgent) {
      suggestions.push(
        'No identifiqué claramente el vendedor. Agrega el nombre del agente al final del texto.',
      );
    }
    if (input.confidence < 0.5) {
      suggestions.push(
        'Baja confianza de parsing. Revisa los datos sugeridos antes de confirmar.',
      );
    }

    return suggestions.length > 0 ? suggestions : undefined;
  }

  private promptHasToken(prompt: string, token: string): boolean {
    if (this.hasWord(prompt, token)) return true;

    if (token.endsWith('s') && this.hasWord(prompt, token.slice(0, -1))) {
      return true;
    }

    return this.hasWord(prompt, `${token}s`);
  }

  private hasWord(text: string, word: string): boolean {
    const pattern = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'i');
    return pattern.test(text);
  }

  private selectInventoryContext(
    prompt: string,
    inventory: InventoryContextItem[],
  ): InventoryContextItem[] {
    if (inventory.length <= this.maxContextItems) {
      return inventory;
    }

    const promptTokens = this.normalizeText(prompt)
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);

    const selected = new Map<string, InventoryContextItem>();

    for (const inventoryItem of inventory) {
      const itemText = `${this.normalizeText(inventoryItem.item)} ${this.normalizeText(
        inventoryItem.quality,
      )}`;
      const isRelevant = promptTokens.some((token) => itemText.includes(token));
      if (isRelevant) {
        selected.set(inventoryItem.id, inventoryItem);
      }
      if (selected.size >= this.maxContextItems) {
        break;
      }
    }

    if (selected.size < this.maxContextItems) {
      for (const inventoryItem of inventory) {
        if (!selected.has(inventoryItem.id)) {
          selected.set(inventoryItem.id, inventoryItem);
        }
        if (selected.size >= this.maxContextItems) {
          break;
        }
      }
    }

    return Array.from(selected.values());
  }

  private buildCacheKey(
    prompt: string,
    language: 'es' | 'en',
    inventory: InventoryContextItem[],
  ): string {
    const inventoryFingerprint = inventory
      .map(
        (item) =>
          `${item.id}:${item.quantity}:${String(item.unitPrice)}:${item.updatedAt.getTime()}`,
      )
      .join('|');

    return `${language}:${prompt}:${this.hashString(inventoryFingerprint)}`;
  }

  private getCachedResponse(key: string): ParseTransactionResponseDto | null {
    const cached = this.responseCache.get(key);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt <= Date.now()) {
      this.responseCache.delete(key);
      return null;
    }

    return this.cloneResponse(cached.response);
  }

  private setCachedResponse(
    key: string,
    response: ParseTransactionResponseDto,
  ): void {
    this.responseCache.set(key, {
      expiresAt: Date.now() + this.cacheTtlMs,
      response: this.cloneResponse(response),
    });

    while (this.responseCache.size > AiService.MAX_CACHE_ENTRIES) {
      const oldestKey = this.responseCache.keys().next().value as
        | string
        | undefined;
      if (!oldestKey) {
        break;
      }
      this.responseCache.delete(oldestKey);
    }
  }

  private cleanupCaches(): void {
    const now = Date.now();
    for (const [key, entry] of this.responseCache.entries()) {
      if (entry.expiresAt <= now) {
        this.responseCache.delete(key);
      }
    }
  }

  private cloneResponse(
    response: ParseTransactionResponseDto,
  ): ParseTransactionResponseDto {
    return {
      ...response,
      items: response.items.map((item) => ({ ...item })),
      suggestions: response.suggestions ? [...response.suggestions] : undefined,
    };
  }

  private isTransientOpenAiError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const candidate = error as {
      status?: number;
      code?: string;
      name?: string;
      message?: string;
    };

    if (typeof candidate.status === 'number') {
      if (candidate.status === 408 || candidate.status === 429) return true;
      if (candidate.status >= 500) return true;
    }

    const code = (candidate.code || '').toUpperCase();
    if (
      code === 'ETIMEDOUT' ||
      code === 'ECONNRESET' ||
      code === 'ECONNABORTED' ||
      code === 'EAI_AGAIN'
    ) {
      return true;
    }

    const name = (candidate.name || '').toLowerCase();
    return (
      name.includes('timeout') ||
      name.includes('abort') ||
      name.includes('connection')
    );
  }

  private summarizeError(error: unknown): string {
    if (typeof error === 'string') return error.slice(0, 120);
    if (error instanceof Error) return error.message.slice(0, 120);
    return 'UNKNOWN_ERROR';
  }

  private normalizePrompt(prompt: string): string {
    return prompt.replace(/\s+/g, ' ').trim();
  }

  private normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9$.,\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseAmount(amount: string): number {
    const sanitized = amount.replace(',', '.');
    const parsed = Number.parseFloat(sanitized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private readEnvNumber(variable: string, fallback: number): number {
    const value = process.env[variable];
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private hashString(value: string): string {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) | 0;
    }
    return hash.toString(16);
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
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
          quantity: Math.max(1, parsed.quantity),
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
