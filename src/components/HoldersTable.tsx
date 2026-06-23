'use client';

import { useState } from 'react';

type Tab = 'Holders' | 'Swaps' | 'Thesis';

const MOCK_HOLDERS = [
  { name: 'mesna', avatar: 'M', avgHold: '2d 12h', position: '$43,329.20', tokens: '14.6k FLKR', pnl: '+$32,588.97', pnlPct: '+303.43%', up: true, avgEntry: '$0.00012', thesis: '10 days till moon, diamond hands only 💎 [Link]' },
  { name: 'beam.me_up', avatar: 'B', avgHold: '5d 8h', position: '$12,450.00', tokens: '2.5B MOON', pnl: '+$8,200.50', pnlPct: '+193.12%', up: true, avgEntry: '$0.00005', thesis: 'Community is strong, devs are doxxed 🚀' },
  { name: 'diamond.hands', avatar: 'D', avgHold: '12d 3h', position: '$89,212.40', tokens: '7.4B PEPE', pnl: '+$45,100.00', pnlPct: '+102.34%', up: true, avgEntry: '$0.00009', thesis: 'Accumulating through the dip, target 10x [Link]' },
  { name: 'rekt.trader', avatar: 'R', avgHold: '1d 6h', position: '$5,200.00', tokens: '35M BONK', pnl: '-$2,300.00', pnlPct: '-30.67%', up: false, avgEntry: '$0.00035', thesis: 'Paper hands, should have held longer' },
  { name: 'whal3.watcher', avatar: 'W', avgHold: '8d 1h', position: '$234,000.00', tokens: '980M SHIB', pnl: '+$89,200.00', pnlPct: '+61.54%', up: true, avgEntry: '$0.00021', thesis: 'Whale accumulation pattern detected 📈 [Link]' },
];

export default function HoldersTable() {
  const [tab, setTab] = useState<Tab>('Holders');

  return (
    <div className="flex flex-col bg-[#12121B] rounded-xl border border-[rgba(255,255,255,.05)] overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,.05)]">
        {(['Holders', 'Swaps', 'Thesis'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider uppercase transition-colors ${
              tab === t
                ? 'text-white border-b-2 border-[#39FF14]'
                : 'text-[#6B7280] hover:text-[#A0A0A0]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'Holders' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,.05)]">
                <th className="text-left px-4 py-2.5 text-[#6B7280] font-medium uppercase tracking-wider">Trader</th>
                <th className="text-right px-4 py-2.5 text-[#6B7280] font-medium uppercase tracking-wider">Position</th>
                <th className="text-right px-4 py-2.5 text-[#6B7280] font-medium uppercase tracking-wider">PnL</th>
                <th className="text-right px-4 py-2.5 text-[#6B7280] font-medium uppercase tracking-wider">Avg Entry</th>
                <th className="text-left px-4 py-2.5 text-[#6B7280] font-medium uppercase tracking-wider">Thesis</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HOLDERS.map((h, i) => (
                <tr key={i} className="border-b border-[rgba(255,255,255,.03)] hover:bg-white/[.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1F2937] shrink-0 flex items-center justify-center text-[10px] font-bold text-[#6B7280]">
                        {h.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-white font-bold">{h.name}</span>
                        <span className="text-[9px] text-[#6B7280] font-mono">{h.avgHold} avg. hold</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col">
                      <span className="text-xs text-white tabular-nums font-bold">{h.position}</span>
                      <span className="text-[9px] text-[#6B7280] tabular-nums">{h.tokens}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col">
                      <span className={`text-xs tabular-nums font-bold ${h.up ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>{h.pnl}</span>
                      <span className={`text-[9px] tabular-nums ${h.up ? 'text-[#00C853]/70' : 'text-[#FF1744]/70'}`}>{h.pnlPct}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-[#A0A0A0] tabular-nums">{h.avgEntry}</td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <div className="flex items-start gap-1">
                      <svg className="w-3 h-3 shrink-0 mt-0.5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                      </svg>
                      <span className="text-[10px] text-[#A0A0A0] leading-tight truncate">{h.thesis}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Swaps' && (
        <div className="flex items-center justify-center h-24 text-xs text-[#6B7280] font-mono">
          Swap history coming soon
        </div>
      )}

      {tab === 'Thesis' && (
        <div className="flex items-center justify-center h-24 text-xs text-[#6B7280] font-mono">
          Community thesis coming soon
        </div>
      )}
    </div>
  );
}
