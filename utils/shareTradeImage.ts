import type { Coin } from "~/types/coins";
import type { Trade } from "~/types/trade";

export interface ShareTradeImageParams {
  trade: Trade;
  coin: Coin | undefined;
  isBuy: boolean;
  entryPrice: number;
  latestPrice: number;
  pnlPercent: number;
}

const WIDTH = 1080;
const HEIGHT = 1080;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function renderTradeShareImage(params: ShareTradeImageParams): HTMLCanvasElement {
  const { trade, coin, isBuy, entryPrice, latestPrice, pnlPercent } = params;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;

  const isProfitable = pnlPercent >= 0;
  const accent = isProfitable ? "#10b981" : "#ef4444";
  const accentSoft = isProfitable ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)";

  // Background
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, "#0f172a");
  bg.addColorStop(1, "#1e293b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Brand
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "700 34px -apple-system, Helvetica, Arial, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("InvestHold", 64, 96);

  // Trade type badge
  ctx.fillStyle = isBuy ? "rgba(16,185,129,0.16)" : "rgba(239,68,68,0.16)";
  roundRect(ctx, WIDTH - 64 - 220, 56, 220, 56, 28);
  ctx.fill();
  ctx.fillStyle = isBuy ? "#34d399" : "#f87171";
  ctx.font = "700 26px -apple-system, Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isBuy ? "ПОКУПКА" : "ПРОДАЖА", WIDTH - 64 - 110, 92);
  ctx.textAlign = "left";

  // Coin avatar (letter-based, avoids CORS-tainting the canvas on export)
  const avatarX = 64;
  const avatarY = 180;
  const avatarR = 56;
  const avatarGrad = ctx.createLinearGradient(avatarX, avatarY - avatarR, avatarX, avatarY + avatarR);
  avatarGrad.addColorStop(0, "#3b82f6");
  avatarGrad.addColorStop(1, "#9333ea");
  ctx.fillStyle = avatarGrad;
  ctx.beginPath();
  ctx.arc(avatarX + avatarR, avatarY, avatarR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 44px -apple-system, Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((coin?.ticker ?? "?").slice(0, 1), avatarX + avatarR, avatarY + 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Coin name / ticker
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 52px -apple-system, Helvetica, Arial, sans-serif";
  ctx.fillText(coin?.ticker ?? "—", avatarX + avatarR * 2 + 28, avatarY - 4);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 28px -apple-system, Helvetica, Arial, sans-serif";
  ctx.fillText(coin?.fullName ?? "", avatarX + avatarR * 2 + 28, avatarY + 34);

  // Big P&L
  ctx.fillStyle = accent;
  ctx.font = "800 180px -apple-system, Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  const pnlText = `${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%`;
  ctx.fillText(pnlText, WIDTH / 2, 540);
  ctx.textAlign = "left";

  ctx.fillStyle = "#64748b";
  ctx.font = "500 30px -apple-system, Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isBuy ? "Изменение с момента входа" : "Результат сделки", WIDTH / 2, 590);
  ctx.textAlign = "left";

  // Stats card
  const cardY = 660;
  const cardH = 300;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  roundRect(ctx, 64, cardY, WIDTH - 128, cardH, 24);
  ctx.fill();

  const stats: [string, string][] = [
    [isBuy ? "Точка входа" : "Цена продажи", `$ ${formatPrice(trade.pricePerUnit)}`],
    [isBuy ? "Текущая цена" : "Средняя цена покупки", `$ ${formatPrice(isBuy ? latestPrice : entryPrice)}`],
    ["Количество", formatQuantity(trade.quantity)],
    ["Сумма", `$ ${formatNumber(trade.totalAmount)}`],
  ];

  const colW = (WIDTH - 128) / 2;
  stats.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 64 + 56 + col * colW;
    const y = cardY + 90 + row * 140;
    ctx.fillStyle = "#64748b";
    ctx.font = "500 26px -apple-system, Helvetica, Arial, sans-serif";
    ctx.fillText(label, x, y);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 40px -apple-system, Helvetica, Arial, sans-serif";
    ctx.fillText(value, x, y + 48);
  });

  // Footer
  ctx.fillStyle = accentSoft;
  roundRect(ctx, 0, HEIGHT - 12, WIDTH, 12, 0);
  ctx.fill();

  ctx.fillStyle = "#475569";
  ctx.font = "500 24px -apple-system, Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(new Date(trade.executedAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" }), WIDTH / 2, HEIGHT - 48);
  ctx.textAlign = "left";

  return canvas;
}

export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, "image/png");
}
