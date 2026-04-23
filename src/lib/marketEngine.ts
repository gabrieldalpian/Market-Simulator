import { Stock } from './types';

export function updateStockPrice(stock: Stock): Stock {
  const baseStep = stock.price * stock.volatility;

  // Momentum contribution: trends the price in the momentum direction
  const momentumEffect = stock.momentum * baseStep;

  // Random noise using Box-Muller transform for more realistic distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const gaussian =
    Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) *
    Math.cos(2 * Math.PI * u2);
  const noise = gaussian * baseStep * 0.5;

  // Calculate new price (never below 0.01)
  const priceChange = momentumEffect + noise;
  const newPrice = Math.max(0.01, stock.price + priceChange);

  // Update momentum: mean-reverting with random perturbation
  const momentumDecay = 0.95;
  const momentumNoise = (Math.random() - 0.5) * 0.02;
  const newMomentum = stock.momentum * momentumDecay + momentumNoise;
  const clampedMomentum = Math.max(-0.1, Math.min(0.1, newMomentum));

  const roundedPrice = Math.round(newPrice * 100) / 100;
  const change = Math.round((roundedPrice - stock.openPrice) * 100) / 100;
  const changePercent =
    stock.openPrice !== 0
      ? Math.round(((roundedPrice - stock.openPrice) / stock.openPrice) * 10000) / 100
      : 0;

  return {
    ...stock,
    price: roundedPrice,
    change,
    changePercent,
    momentum: clampedMomentum,
    high: Math.max(stock.high, roundedPrice),
    low: Math.min(stock.low, roundedPrice),
    weekHighPrice: Math.max(stock.weekHighPrice, roundedPrice),
    weekLowPrice: Math.min(stock.weekLowPrice, roundedPrice),
  };
}

export function applyEventImpact(
  stock: Stock,
  impacts: Record<string, number>
): Stock {
  const impact = impacts[stock.sector];
  if (impact === undefined) return stock;

  // Apply percentage impact to current price
  const priceChange = stock.price * impact;
  const newPrice = Math.max(0.01, stock.price + priceChange);

  // Push momentum in the event direction
  const newMomentum = Math.max(
    -0.1,
    Math.min(0.1, stock.momentum + impact * 0.5)
  );

  const roundedPrice = Math.round(newPrice * 100) / 100;
  const change = Math.round((roundedPrice - stock.openPrice) * 100) / 100;
  const changePercent =
    stock.openPrice !== 0
      ? Math.round(((roundedPrice - stock.openPrice) / stock.openPrice) * 10000) / 100
      : 0;

  return {
    ...stock,
    price: roundedPrice,
    change,
    changePercent,
    momentum: newMomentum,
    high: Math.max(stock.high, roundedPrice),
    low: Math.min(stock.low, roundedPrice),
    weekHighPrice: Math.max(stock.weekHighPrice, roundedPrice),
    weekLowPrice: Math.min(stock.weekLowPrice, roundedPrice),
  };
}
