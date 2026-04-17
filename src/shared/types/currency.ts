export const invoiceCurrencies = ['RSD', 'EUR', 'USD', 'GBP', 'CHF', 'CNY'] as const;

export type CurrencyCode = (typeof invoiceCurrencies)[number];

export const totalYearAmountCurrencies = ['RSD', 'EUR'] as const;

export type TotalYearAmountCurrencyCode = (typeof totalYearAmountCurrencies)[number];
