export const formatReportDate = (date?: Date | string | null): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatReportDateTime = (date?: Date | string | null): string => {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
};

export const formatSaleDateTime = (date?: Date | string | null): string => {
  if (!date) return '-';
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
