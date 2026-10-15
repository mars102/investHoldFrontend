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
  // Set when the mark is too far from the price data to fit without flattening
  // the line — the caller should render it as an edge tag instead of a line.
  markOffscreen: 'above' | 'below' | null
  // Maps a price into the chart's 0..100 Y space (may fall outside it).
  priceToY: (price: number) => number
}

// The mark is pulled into the Y range only if that keeps the price data at
// least this share of the chart height; otherwise it goes offscreen.
const MIN_DATA_SHARE = 0.4

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

// Thins a series to at most `buckets` points over equal time slices (last
// price in each slice), always keeping the first and last point.
export function downsampleByTime<T extends { price: number; timestamp: string }>(points: T[], buckets = 250): T[] {
  if (points.length <= buckets) return points
  const t0 = new Date(points[0]!.timestamp).getTime()
  const span = new Date(points[points.length - 1]!.timestamp).getTime() - t0
  if (span <= 0) return points

  const lastInBucket = new Map<number, T>()
  for (let i = 1; i < points.length - 1; i++) {
    const bucket = Math.floor(((new Date(points[i]!.timestamp).getTime() - t0) / span) * buckets)
    lastInBucket.set(bucket, points[i]!)
  }
  return [points[0]!, ...lastInBucket.values(), points[points.length - 1]!]
}

// How far the mark is from the current price, e.g. "+1290%" for an entry far above.
export function formatMarkDistance(mark: number, current: number): string {
  if (!mark || !current) return ''
  const pct = ((mark - current) / current) * 100
  const rounded = Math.abs(pct) >= 100 ? Math.round(pct) : Number(pct.toFixed(1))
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

export function computeChartGeometry(
  points: { price: number; timestamp: string }[],
  markValue?: number | null
): ChartGeometry | null {
  if (!points.length) return null

  const prices = points.map((p) => p.price)
  const mark = markValue ?? 0
  const dataMin = Math.min(...prices)
  const dataMax = Math.max(...prices)
  // A perfectly flat series would otherwise get a zero range; give it a
  // small band around the price so the line sits mid-chart.
  const dataRange = dataMax - dataMin || Math.abs(dataMax) * 0.02 || 1

  let markOffscreen: ChartGeometry['markOffscreen'] = null
  let min = dataMin
  let max = dataMax
  if (mark > 0) {
    const withMarkRange = Math.max(dataMax, mark) - Math.min(dataMin, mark)
    if (dataRange / withMarkRange >= MIN_DATA_SHARE) {
      min = Math.min(dataMin, mark)
      max = Math.max(dataMax, mark)
    } else {
      markOffscreen = mark > dataMax ? 'above' : 'below'
    }
  }

  const range = max - min || dataRange
  const pad = range * 0.15
  const scaledMin = min - pad
  const scaledMax = max + pad
  const scaledRange = scaledMax - scaledMin || 1

  const priceToY = (price: number) => 100 - ((price - scaledMin) / scaledRange) * 100

  // X follows time, not point index: history mixes daily CoinGecko points with
  // dense recent snapshots, and index spacing would stretch the recent part.
  const n = points.length
  const t0 = new Date(points[0]!.timestamp).getTime()
  const tSpan = new Date(points[n - 1]!.timestamp).getTime() - t0
  const coords: ChartCoord[] = points.map((p, i) => ({
    x: n === 1 ? 50 : tSpan > 0 ? ((new Date(p.timestamp).getTime() - t0) / tSpan) * 100 : (i / (n - 1)) * 100,
    y: priceToY(p.price),
    price: p.price,
    timestamp: p.timestamp
  }))

  const linePath = buildSmoothPath(coords)
  const areaPath = `${linePath} L ${coords[coords.length - 1]!.x},100 L ${coords[0]!.x},100 Z`
  const markY = mark > 0 && !markOffscreen ? priceToY(mark) : null

  return { coords, linePath, areaPath, markY, markOffscreen, priceToY }
}
