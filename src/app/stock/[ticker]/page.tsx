import StockPageClient from '@/components/StockPageClient';

export default function StockPage({
  params,
}: {
  params: { ticker: string };
}) {
  return <StockPageClient ticker={params.ticker} />;
}
