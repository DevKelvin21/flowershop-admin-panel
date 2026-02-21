export interface ParsedBulkInventoryRow {
  lineNumber: number;
  raw: string;
  item: string;
  quantity: number;
  quality: string;
}

export interface BulkInventoryParseError {
  lineNumber: number;
  raw: string;
  reason: string;
}

export interface BulkInventoryParseResult {
  rows: ParsedBulkInventoryRow[];
  errors: BulkInventoryParseError[];
}

interface ParseLineResultSuccess {
  ok: true;
  value: ParsedBulkInventoryRow;
}

interface ParseLineResultError {
  ok: false;
  error: BulkInventoryParseError;
}

type ParseLineResult = ParseLineResultSuccess | ParseLineResultError;

const WORD_TO_NUMBER: Record<string, number> = {
  cero: 0,
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  media: 0.5,
  medio: 0.5,
};

const QUALITY_MAP: Record<string, string> = {
  especial: 'special',
  regular: 'regular',
};

function parseNumberToken(token: string): number | null {
  const normalized = token.trim().toLowerCase();
  const fromWords = WORD_TO_NUMBER[normalized];
  if (fromWords !== undefined) return fromWords;

  const numeric = Number(normalized.replace(',', '.'));
  if (!Number.isFinite(numeric)) return null;
  return numeric;
}

function normalizeItemName(value: string): string {
  return value
    .replace(/^(de|del)\s+/i, '')
    .replace(/[.,;:]+$/, '')
    .trim();
}

function removeQualityFromLine(rawLine: string): {
  cleanedLine: string;
  qualityFromLine: string | null;
} {
  const qualityMatch = rawLine.match(/\b(?:calidad\s+)?(especial|regular)\b/i);
  if (!qualityMatch) {
    return { cleanedLine: rawLine.trim(), qualityFromLine: null };
  }

  const token = qualityMatch[1]?.toLowerCase() ?? '';
  const qualityFromLine = QUALITY_MAP[token] ?? null;
  const cleanedLine = rawLine
    .replace(/\b(?:calidad\s+)?(especial|regular)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    cleanedLine,
    qualityFromLine,
  };
}

function buildError(
  lineNumber: number,
  raw: string,
  reason: string,
): ParseLineResultError {
  return {
    ok: false,
    error: {
      lineNumber,
      raw,
      reason,
    },
  };
}

function toQuantityFromDozen(
  lineNumber: number,
  raw: string,
  baseValue: number,
): number | ParseLineResultError {
  const quantity = baseValue * 12;
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return buildError(
      lineNumber,
      raw,
      'La cantidad en docenas debe resultar en un entero positivo',
    );
  }

  return quantity;
}

function parseLine(
  rawLine: string,
  lineNumber: number,
  defaultQuality: string,
): ParseLineResult {
  const raw = rawLine.trim();
  if (!raw) {
    return buildError(lineNumber, rawLine, 'Línea vacía');
  }

  const { cleanedLine, qualityFromLine } = removeQualityFromLine(raw);
  const quality = qualityFromLine ?? defaultQuality;

  const halfDozenMatch = cleanedLine.match(
    /^(?:media|medio|1\/2|0[.,]5)\s+docena(?:s)?\s+(?:de\s+)?(.+)$/i,
  );
  if (halfDozenMatch) {
    const item = normalizeItemName(halfDozenMatch[1] ?? '');
    if (!item) {
      return buildError(lineNumber, raw, 'No se pudo identificar el artículo');
    }

    return {
      ok: true,
      value: {
        lineNumber,
        raw,
        item,
        quantity: 6,
        quality,
      },
    };
  }

  const dozenMatch = cleanedLine.match(
    /^([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,]+)\s+docena(?:s)?\s+(?:de\s+)?(.+)$/i,
  );
  if (dozenMatch) {
    const quantityToken = dozenMatch[1] ?? '';
    const item = normalizeItemName(dozenMatch[2] ?? '');
    const baseValue = parseNumberToken(quantityToken);

    if (baseValue === null) {
      return buildError(
        lineNumber,
        raw,
        'No se pudo interpretar la cantidad de docenas',
      );
    }
    if (!item) {
      return buildError(lineNumber, raw, 'No se pudo identificar el artículo');
    }

    const quantity = toQuantityFromDozen(lineNumber, raw, baseValue);
    if (typeof quantity !== 'number') {
      return quantity;
    }

    return {
      ok: true,
      value: {
        lineNumber,
        raw,
        item,
        quantity,
        quality,
      },
    };
  }

  const unitMatch = cleanedLine.match(
    /^([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,]+)\s+(?:unidad(?:es)?|uds?|u)\s+(?:de\s+)?(.+)$/i,
  );
  if (unitMatch) {
    const quantityToken = unitMatch[1] ?? '';
    const item = normalizeItemName(unitMatch[2] ?? '');
    const quantityValue = parseNumberToken(quantityToken);

    if (quantityValue === null || !Number.isInteger(quantityValue) || quantityValue <= 0) {
      return buildError(
        lineNumber,
        raw,
        'La cantidad en unidades debe ser un entero positivo',
      );
    }
    if (!item) {
      return buildError(lineNumber, raw, 'No se pudo identificar el artículo');
    }

    return {
      ok: true,
      value: {
        lineNumber,
        raw,
        item,
        quantity: quantityValue,
        quality,
      },
    };
  }

  const genericMatch = cleanedLine.match(
    /^([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,]+)\s+(.+)$/i,
  );
  if (genericMatch) {
    const quantityToken = genericMatch[1] ?? '';
    const item = normalizeItemName(genericMatch[2] ?? '');
    const quantityValue = parseNumberToken(quantityToken);

    if (quantityValue === null || !Number.isInteger(quantityValue) || quantityValue <= 0) {
      return buildError(
        lineNumber,
        raw,
        'No se pudo interpretar la cantidad (usa número o docenas)',
      );
    }
    if (!item) {
      return buildError(lineNumber, raw, 'No se pudo identificar el artículo');
    }

    return {
      ok: true,
      value: {
        lineNumber,
        raw,
        item,
        quantity: quantityValue,
        quality,
      },
    };
  }

  return buildError(
    lineNumber,
    raw,
    'Formato no reconocido. Ejemplo: "5 docenas de rosa"',
  );
}

export function parseBulkInventoryInput(
  input: string,
  defaultQuality: string,
): BulkInventoryParseResult {
  const errors: BulkInventoryParseError[] = [];
  const aggregated = new Map<string, ParsedBulkInventoryRow>();

  input.split('\n').forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const lineNumber = index + 1;
    const parsed = parseLine(line, lineNumber, defaultQuality);

    if (!parsed.ok) {
      errors.push(parsed.error);
      return;
    }

    const key = `${parsed.value.item.toLowerCase()}::${parsed.value.quality}`;
    const existing = aggregated.get(key);

    if (existing) {
      existing.quantity += parsed.value.quantity;
      return;
    }

    aggregated.set(key, { ...parsed.value });
  });

  return {
    rows: Array.from(aggregated.values()),
    errors,
  };
}
