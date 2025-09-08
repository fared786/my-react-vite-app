export const money = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'AUD' }).format(n)
