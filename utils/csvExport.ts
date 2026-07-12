import type { Trade } from "~/types/trade";
import type { Coin } from "~/types/coins";

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function tradesToCsv(trades: Trade[], coinsById: Record<number, Coin>): string {
  const headers = [
    "Дата",
    "Тип",
    "Монета",
    "Количество",
    "Цена за единицу",
    "Сумма",
    "Комиссия",
    "Валюта комиссии",
    "Биржа",
    "Комментарий",
  ];

  const rows = trades.map((trade) => {
    const coin = trade.coinId != null ? coinsById[Number(trade.coinId)] : undefined;
    return [
      new Date(trade.executedAt).toLocaleString("ru-RU"),
      trade.type,
      coin ? `${coin.fullName} (${coin.ticker})` : String(trade.coinId ?? ""),
      trade.quantity,
      trade.pricePerUnit,
      trade.totalAmount,
      trade.fee,
      trade.feeCurrency,
      trade.exchangeSource,
      trade.description,
    ].map(escapeCsvField);
  });

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
