import type { CurrencyCode } from '../../../shared/types/currency';
import { WebStorage } from '../../lib/storage/web-storage';

const storage = new WebStorage();
const cacheKey = 'invoice-app/nbs-middle-rates-v1';

type RateCache = Record<string, number>;

function formatNbsDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${Number(day)}.${Number(month)}.${year}.`;
}

function parseLocalizedNumber(value: string): number {
  return Number(value.replace(/\./g, '').replace(',', '.').trim());
}

function readCache(): RateCache {
  return storage.read<RateCache>(cacheKey, {});
}

function writeCache(nextCache: RateCache): void {
  storage.write(cacheKey, nextCache);
}

function parseRateFromHtml(html: string, currencyCode: string): number {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const rows = Array.from(document.querySelectorAll('table tbody tr'));

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? '');
    if (cells.length < 5) {
      continue;
    }

    if (cells[0].toUpperCase() !== currencyCode) {
      continue;
    }

    const appliesFor = parseLocalizedNumber(cells[3]);
    const rateValue = parseLocalizedNumber(cells[4]);

    if (!Number.isFinite(appliesFor) || appliesFor <= 0 || !Number.isFinite(rateValue)) {
      throw new Error(`Invalid NBS rate row for ${currencyCode}.`);
    }

    return rateValue / appliesFor;
  }

  throw new Error(`NBS middle rate for ${currencyCode} was not found.`);
}

export async function getNbsMiddleRate(date: string, currencyCode: CurrencyCode): Promise<number> {
  const normalizedCurrency = currencyCode.toUpperCase();

  if (normalizedCurrency === 'RSD') {
    return 1;
  }

  const rateLookupKey = `${date}:${normalizedCurrency}`;
  const cache = readCache();

  if (cache[rateLookupKey]) {
    return cache[rateLookupKey];
  }

  const response = await fetch(
    `/nbs-exchange-rate/ExchangeRateWebApp/ExchangeRate/IndexByDate?isSearchExecuted=true&Date=${encodeURIComponent(
      formatNbsDate(date)
    )}&ExchangeRateListTypeID=3`
  );

  if (!response.ok) {
    throw new Error(`NBS request failed with status ${response.status}.`);
  }

  const html = await response.text();
  const rate = parseRateFromHtml(html, normalizedCurrency);

  writeCache({
    ...cache,
    [rateLookupKey]: rate
  });

  return rate;
}

export async function convertInvoiceAmountToRsd(
  amount: number,
  currencyCode: CurrencyCode,
  invoiceDate: string
): Promise<number> {
  const rate = await getNbsMiddleRate(invoiceDate, currencyCode);
  return amount * rate;
}

export async function convertInvoiceAmountToCurrency(
  amount: number,
  sourceCurrencyCode: CurrencyCode,
  targetCurrencyCode: CurrencyCode,
  invoiceDate: string
): Promise<number> {
  if (sourceCurrencyCode === targetCurrencyCode) {
    return amount;
  }

  const sourceRate = await getNbsMiddleRate(invoiceDate, sourceCurrencyCode);
  const targetRate = await getNbsMiddleRate(invoiceDate, targetCurrencyCode);

  return (amount * sourceRate) / targetRate;
}
