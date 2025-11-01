const ngnFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
})

export function formatNGN(value: number | string) {
  const num = typeof value === 'number' ? value : Number(value)
  return ngnFormatter.format(isNaN(num) ? 0 : num)
}


