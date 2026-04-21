'use client';

import { useMarketStore } from '@/lib/store';
import { eventDefinitions } from '@/lib/events';

const sectorIcons: Record<string, string> = {
  Technology: '💻', Energy: '⚡', Healthcare: '🧬', Entertainment: '🎬',
  Aerospace: '🚀', Finance: '💰', Materials: '⛏️', Consumer: '🛍️',
  Industrial: '🏭', Telecom: '📡', Global: '🌐',
};

const sectorHeaderColors: Record<string, string> = {
  Technology: 'from-blue-500 to-blue-600',
  Energy: 'from-amber-500 to-amber-600',
  Healthcare: 'from-emerald-500 to-emerald-600',
  Entertainment: 'from-purple-500 to-purple-600',
  Aerospace: 'from-sky-500 to-sky-600',
  Finance: 'from-indigo-500 to-indigo-600',
  Materials: 'from-orange-500 to-orange-600',
  Consumer: 'from-pink-500 to-pink-600',
  Industrial: 'from-slate-500 to-slate-600',
  Telecom: 'from-cyan-500 to-cyan-600',
  Global: 'from-gray-500 to-gray-600',
};

const sectorImageGradients: Record<string, string> = {
  Technology: 'from-blue-400 via-indigo-500 to-purple-600',
  Energy: 'from-amber-400 via-orange-500 to-red-500',
  Healthcare: 'from-emerald-400 via-teal-500 to-cyan-600',
  Entertainment: 'from-purple-400 via-fuchsia-500 to-pink-500',
  Aerospace: 'from-sky-400 via-blue-500 to-indigo-600',
  Finance: 'from-indigo-400 via-blue-500 to-cyan-500',
  Materials: 'from-orange-400 via-amber-500 to-yellow-500',
  Consumer: 'from-pink-400 via-rose-500 to-red-500',
  Industrial: 'from-slate-400 via-gray-500 to-zinc-600',
  Telecom: 'from-cyan-400 via-teal-500 to-emerald-500',
  Global: 'from-gray-400 via-slate-500 to-gray-600',
};

interface NewsItem {
  id: string;
  title: string;
  description: string;
  sector: string;
  impact: number;
  timeLabel: string;
  isLive: boolean;
}

const staticNews: NewsItem[] = [
  { id: 'sn-1', title: 'AI Infrastructure Spending Hits Record High', description: 'Global AI infrastructure investments reach $150B as companies race to build computing capacity for next-gen models. NexaAI and Pulsar Robotics expected to benefit significantly from the surge in demand for AI chips and compute.', sector: 'Technology', impact: 3.2, timeLabel: '2h ago', isLive: false },
  { id: 'sn-2', title: 'Renewable Energy Tax Credits Extended Through 2030', description: 'Congress passes sweeping legislation extending clean energy tax credits, boosting solar, wind, and hydrogen sector investments across the board. SolarVault and HydroGen Systems rally.', sector: 'Energy', impact: 4.5, timeLabel: '3h ago', isLive: false },
  { id: 'sn-3', title: 'Gene Therapy Breakthrough Announced by Syntherix', description: 'Syntherix Biotech announces successful Phase 3 trials for its novel CRISPR-based treatment targeting rare genetic diseases, beating analyst expectations with 94% efficacy rate.', sector: 'Healthcare', impact: 5.1, timeLabel: '4h ago', isLive: false },
  { id: 'sn-4', title: 'Space Tourism Revenue Projections Raised to $8B', description: 'Analysts upgrade orbital tourism market size estimates to $8B by 2028 after strong commercial flight bookings from OrbitX Aerospace and StarAxis Corp.', sector: 'Aerospace', impact: 2.8, timeLabel: '5h ago', isLive: false },
  { id: 'sn-5', title: 'VR Streaming Platform Debuts to 10M Subscribers', description: 'VirtuWorld Media launches immersive virtual reality streaming service with record first-week adoption, disrupting traditional entertainment. StreamWave expected to follow suit.', sector: 'Entertainment', impact: 6.2, timeLabel: '6h ago', isLive: false },
  { id: 'sn-6', title: 'Federal Reserve Signals Rate Stability Through Q3', description: 'Central bank indicates rates will hold steady through Q3, providing predictability for financial sector operations. Vaultex Capital and Cradle Finance see positive outlook.', sector: 'Finance', impact: 1.5, timeLabel: '7h ago', isLive: false },
  { id: 'sn-7', title: 'Rare Earth Discovery in Northern Canada', description: 'TerraNova Mining announces discovery of significant rare earth mineral deposits valued at $12B, shares surge in premarket trading on supply chain implications for tech manufacturing.', sector: 'Materials', impact: 8.3, timeLabel: '8h ago', isLive: false },
  { id: 'sn-8', title: 'Luxury Brands Report Record Q3 Earnings', description: 'NobleBrand Luxury and other premium consumer companies report strongest quarterly earnings in five years, driven by emerging market demand and digital commerce expansion.', sector: 'Consumer', impact: 4.7, timeLabel: '9h ago', isLive: false },
  { id: 'sn-9', title: 'AutoMate Systems Wins Pentagon Automation Contract', description: 'AutoMate Systems secures $3.2B Pentagon contract for next-generation manufacturing automation, beating three rival bidders. DroneForge Inc also awarded subcontractor role.', sector: 'Industrial', impact: 5.4, timeLabel: '10h ago', isLive: false },
  { id: 'sn-10', title: '5G Satellite Network Reaches 40-Country Milestone', description: 'WaveLink Networks and Signal Dynamics announce their joint low-orbit 5G satellite network has achieved coverage in 40 countries, unlocking rural enterprise contracts worth $2B annually.', sector: 'Telecom', impact: 3.1, timeLabel: '11h ago', isLive: false },
  { id: 'sn-11', title: 'Quantum Computing Logistics Milestone Achieved', description: 'Pulsar Robotics demonstrates quantum advantage in real-world supply chain optimization, marking an industry first for practical quantum applications in warehousing and distribution.', sector: 'Technology', impact: 4.7, timeLabel: '12h ago', isLive: false },
  { id: 'sn-12', title: 'GrapheneX Reveals Battery Breakthrough', description: 'GrapheneX Ltd unveils graphene-based solid-state battery with 3x energy density and 10-minute charging. Partnership with major EV manufacturers expected within weeks.', sector: 'Materials', impact: 7.2, timeLabel: '13h ago', isLive: false },
  { id: 'sn-13', title: 'FinexAI Trading Platform Surpasses $1T Daily Volume', description: 'FinexAI Trading reports its algorithmic platform now handles over $1 trillion in daily transactions, making it the largest AI-driven exchange infrastructure globally.', sector: 'Finance', impact: 3.8, timeLabel: '14h ago', isLive: false },
  { id: 'sn-14', title: 'Metaverse Studios Acquires Major Gaming Publisher', description: 'Metaverse Studios announces $4.5B acquisition of leading gaming publisher, consolidating its position in the immersive entertainment space. Integration expected by Q2.', sector: 'Entertainment', impact: 5.5, timeLabel: '15h ago', isLive: false },
  { id: 'sn-15', title: 'Lunar Industries Secures Moon Base Construction Contract', description: 'Lunar Industries awarded primary contractor role for international moon base construction project, the largest space infrastructure project in history at $18B over 8 years.', sector: 'Aerospace', impact: 9.1, timeLabel: '16h ago', isLive: false },
];

export default function EventsPageClient() {
  const eventLog = useMarketStore((s) => s.eventLog);
  const triggerEvent = useMarketStore((s) => s.triggerEvent);

  // Mix live events with static news
  const liveNews: NewsItem[] = eventLog.map((e) => {
    const sectors = Object.entries(e.impacts);
    const primarySector = sectors.length > 0 ? sectors[0][0] : 'Global';
    const totalImpact = sectors.reduce((sum, [, v]) => sum + v, 0) * 100;
    return {
      id: e.id,
      title: e.name,
      description: e.description,
      sector: primarySector,
      impact: totalImpact,
      timeLabel: new Date(e.timestamp).toLocaleTimeString(),
      isLive: true,
    };
  });

  const allNews = [...liveNews, ...staticNews];

  return (
    <div className="w-full px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold text-gray-900">Market Events &amp; News</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-mono">{allNews.length} stories</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* News Feed */}
        <div className="xl:col-span-3 space-y-4">
          {allNews.map((item) => {
            const icon = sectorIcons[item.sector] || '📊';
            const gradient = sectorHeaderColors[item.sector] || sectorHeaderColors['Global'];
            const imageGradient = sectorImageGradients[item.sector] || sectorImageGradients['Global'];
            const impactPositive = item.impact >= 0;
            return (
              <div key={item.id} className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm ${item.isLive ? 'slide-in ring-2 ring-blue-200' : ''}`}>
                <div className="flex">
                  {/* Colored sidebar */}
                  <div className={`w-1.5 bg-gradient-to-b ${gradient} flex-shrink-0`} />

                  {/* Image */}
                  <div className="w-48 h-auto flex-shrink-0 relative overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${item.id}/192/140`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${imageGradient} opacity-30`} />
                    <span className="absolute bottom-2 left-2 text-2xl drop-shadow-lg">{icon}</span>
                  </div>

                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 uppercase tracking-wider font-semibold">{item.sector}</span>
                          {item.isLive && (
                            <span className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-bold uppercase">Live</span>
                          )}
                          <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{item.timeLabel}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                      </div>
                      <div className={`flex-shrink-0 px-3 py-2 rounded-lg text-base font-mono font-bold ${impactPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {impactPositive ? '+' : ''}{item.impact.toFixed(1)}%
                      </div>
                    </div>
                    {/* Show sector breakdown for live events */}
                    {item.isLive && (() => {
                      const event = eventLog.find((e) => e.id === item.id);
                      if (!event) return null;
                      return (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                          {Object.entries(event.impacts).map(([sector, impact]) => (
                            <span key={sector} className={`text-xs px-2 py-1 rounded-md font-mono font-semibold ${impact >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {sector} {impact >= 0 ? '+' : ''}{(impact * 100).toFixed(0)}%
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trigger Events */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Trigger Event</h3>
            </div>
            <div className="p-3 space-y-2">
              {eventDefinitions.map((eventDef) => {
                const totalImpact = Object.values(eventDef.impacts).reduce((a, b) => a + b, 0);
                const isPositive = totalImpact > 0;
                return (
                  <button
                    key={eventDef.id}
                    onClick={() => triggerEvent(eventDef)}
                    className="w-full text-left px-4 py-3 rounded-lg border transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      borderColor: eventDef.color + '40',
                      backgroundColor: eventDef.color + '08',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: eventDef.color }}>{eventDef.name}</span>
                      <span className={`text-xs font-mono font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{(totalImpact * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{eventDef.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sector Impact Summary */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Sector Impact Map</h3>
            </div>
            <div className="p-3">
              {Object.keys(sectorIcons).filter((s) => s !== 'Global').map((sector) => {
                const eventsForSector = eventLog.filter((e) => e.impacts[sector] !== undefined);
                const totalImpact = eventsForSector.reduce((sum, e) => sum + (e.impacts[sector] || 0), 0);
                return (
                  <div key={sector} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sectorIcons[sector]}</span>
                      <span className="text-sm text-gray-700">{sector}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${totalImpact >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{ width: `${Math.min(100, Math.abs(totalImpact) * 200)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono font-bold w-14 text-right ${totalImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalImpact === 0 ? '—' : `${totalImpact >= 0 ? '+' : ''}${(totalImpact * 100).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Event Stats</h3>
            </div>
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Total Events</span>
                <span className="text-sm font-mono font-bold text-gray-900">{eventLog.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Positive Events</span>
                <span className="text-sm font-mono font-bold text-green-600">
                  {eventLog.filter((e) => Object.values(e.impacts).reduce((a, b) => a + b, 0) > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Negative Events</span>
                <span className="text-sm font-mono font-bold text-red-600">
                  {eventLog.filter((e) => Object.values(e.impacts).reduce((a, b) => a + b, 0) < 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Sectors Affected</span>
                <span className="text-sm font-mono font-bold text-gray-900">
                  {new Set(eventLog.flatMap((e) => Object.keys(e.impacts))).size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
