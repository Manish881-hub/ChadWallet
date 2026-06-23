'use client';

import { useState } from 'react';

type Tab = 'Holders' | 'Swaps' | 'Thesis';

const MOCK_HOLDERS = [
  { trader: 'highest.in.the.room', pnl: '+$893,492', avgEntry: '$0.00012', position: '7.4B', up: true },
  { trader: 'beam.me.up', pnl: '+$452,000', avgEntry: '$0.00018', position: '2.5B', up: true },
  { trader: 'moon.or.bust', pnl: '+$128,400', avgEntry: '$0.00021', position: '611M', up: true },
  { trader: 'diamond.dog', pnl: '-$12,500', avgEntry: '$0.00035', position: '35M', up: false },
  { trader: 'just.a.png', pnl: '+$89,200', avgEntry: '$0.00009', position: '980M', up: true },
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
                <th className="text-right px-4 py-2.5 text-[#6B7280] font-medium uppercase tracking-wider">Avg Entry</th>
                <th className="text-right px-4 py-2.5 text-[#6B7280] font-medium uppercase tracking-wider">PnL</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HOLDERS.map((h, i) => (
                <tr key={i} className="border-b border-[rgba(255,255,255,.03)] hover:bg-white/[.02] transition-colors">
                  <td className="px-4 py-3 text-white">{h.trader}</td>
                  <td className="px-4 py-3 text-right text-white tabular-nums">{h.position}</td>
                  <td className="px-4 py-3 text-right text-[#A0A0A0] tabular-nums">{h.avgEntry}</td>
                  <td className={`px-4 py-3 text-right tabular-nums font-bold ${h.up ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                    {h.pnl}
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
