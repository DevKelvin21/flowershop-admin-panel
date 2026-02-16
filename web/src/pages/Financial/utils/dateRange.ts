const CENTRAL_TIME_ZONE = 'America/Chicago';

function getDateString(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CENTRAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getDefaultFinancialDateRange(): {
  today: string;
  tomorrow: string;
} {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    today: getDateString(today),
    tomorrow: getDateString(tomorrow),
  };
}
