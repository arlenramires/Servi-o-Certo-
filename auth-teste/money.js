// Decimal input is converted as text to avoid floating-point errors such as 0.29 * 100.
export function parseMoneyToCents(value) {
  const normalized=String(value).trim();
  if(!/^\d+(?:[.,]\d{1,2})?$/.test(normalized))return null;
  const [whole,fraction='']=normalized.split(/[.,]/);
  const cents=BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
  return cents>0n&&cents<=BigInt(Number.MAX_SAFE_INTEGER)?Number(cents):null;
}
export function formatCents(value) {
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)/100);
}
