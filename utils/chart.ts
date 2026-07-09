export interface ChartCoord {
  x: number
  y: number
  price: number
  timestamp: string
}

export interface ChartGeometry {
  coords: ChartCoord[]
  linePath: string
  areaPath: string
  markY: number | null
}

export function buildSmoothPath(coords: { x: number; y: number }[]): string {
  if (!coords.length) return ''
  if (coords.length === 1) return `M ${coords[0]!.x},${coords[0]!.y}`
  let d = `M ${coords[0]!.x},${coords[0]!.y}`
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i]!
    const next = coords[i + 1]!
    const midX = (curr.x + next.x) / 2
    const midY = (curr.y + next.y) / 2
    d += ` Q ${curr.x},${curr.y} ${midX},${midY}`
  }
  const last = coords[coords.length - 1]!
  d += ` L ${last.x},${last.y}`
  return d
}

export function computeChartGeometry(
  points: { price: number; timestamp: string }[],
  markValue?: number | null
): ChartGeometry | null {
  if (!points.length) return null

  const prices = points.map((p) => p.price)
  const mark = markValue ?? 0
  const allValues = mark > 0 ? [...prices, mark] : prices
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const range = max - min || max || 1
  const pad = range * 0.15
  const scaledMin = min - pad
  const scaledMax = max + pad
  const scaledRange = scaledMax - scaledMin || 1

  const n = points.length
  const coords: ChartCoord[] = points.map((p, i) => ({
    x: n === 1 ? 50 : (i / (n - 1)) * 100,
    y: 100 - ((p.price - scaledMin) / scaledRange) * 100,
    price: p.price,
    timestamp: p.timestamp
  }))

  const linePath = buildSmoothPath(coords)
  const areaPath = `${linePath} L ${coords[coords.length - 1]!.x},100 L ${coords[0]!.x},100 Z`
  const markY = mark > 0 ? 100 - ((mark - scaledMin) / scaledRange) * 100 : null

  return { coords, linePath, areaPath, markY }
}
