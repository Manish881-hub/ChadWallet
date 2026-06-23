import Link from 'next/link';

export default function TradeFooter() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-[#1F2937] bg-[#09090F] flex py-1.5 items-center justify-between gap-4 px-3 text-xs">
      <div className="flex items-center gap-4 shrink-0 overflow-x-auto no-scrollbar">
        <Link 
          href="/tokens/solana/cbbtcf3aa214zXhbiAZQw" 
          data-discover="true" 
          className="flex items-center gap-1 shrink-0 transition-opacity hover:opacity-80"
        >
          <img alt="BTC" className="size-4 rounded-full border border-[#1F2937]" src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png" />
          <span className="leading-none tabular-nums" translate="no">$62,903.29</span>
          <div className="flex gap-[3px] items-center" translate="no" style={{ lineHeight: '16px' }}>
            <div style={{ color: 'rgb(255, 98, 46)', fontWeight: 400, fontSize: '6px' }}>▼</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(255, 98, 46)' }}>2.07%</div>
          </div>
        </Link>
        
        <Link 
          href="/tokens/solana/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs" 
          data-discover="true" 
          className="flex items-center gap-1 shrink-0 transition-opacity hover:opacity-80"
        >
          <img alt="ETH" className="size-4 rounded-full border border-[#1F2937]" src="https://assets.coingecko.com/coins/images/279/large/ethereum.png" />
          <span className="leading-none tabular-nums" translate="no">$1,688.78</span>
          <div className="flex gap-[3px] items-center" translate="no" style={{ lineHeight: '16px' }}>
            <div style={{ color: 'rgb(255, 98, 46)', fontWeight: 400, fontSize: '6px' }}>▼</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(255, 98, 46)' }}>3.42%</div>
          </div>
        </Link>

        <Link 
          href="/tokens/solana/So11111111111111111111111111111111111111112" 
          data-discover="true" 
          className="flex items-center gap-1 shrink-0 transition-opacity hover:opacity-80"
        >
          <img alt="SOL" className="size-4 rounded-full border border-[#1F2937]" src="https://assets.coingecko.com/coins/images/4128/large/solana.png" />
          <span className="leading-none tabular-nums" translate="no">$70.18</span>
          <div className="flex gap-[3px] items-center" translate="no" style={{ lineHeight: '16px' }}>
            <div style={{ color: 'rgb(0, 200, 83)', fontWeight: 400, fontSize: '6px' }}>▲</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(0, 200, 83)' }}>1.15%</div>
          </div>
        </Link>

        <Link 
          href="/tokens/solana/98sMhvDw" 
          data-discover="true" 
          className="flex items-center gap-1 shrink-0 transition-opacity hover:opacity-80"
        >
          <img alt="HYPE" className="size-4 rounded-full border border-[#1F2937]" src="https://assets.coingecko.com/coins/images/50882/large/hyperliquid.jpg" />
          <span className="leading-none tabular-nums" translate="no">$64.09</span>
          <div className="flex gap-[3px] items-center" translate="no" style={{ lineHeight: '16px' }}>
            <div style={{ color: 'rgb(255, 98, 46)', fontWeight: 400, fontSize: '6px' }}>▼</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(255, 98, 46)' }}>4.68%</div>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 cursor-default">
          <div className="relative flex size-1.5 items-center justify-center">
            <div className="relative size-full rounded-full bg-[#00C853]"></div>
          </div>
          <span className="text-xs font-bold text-[#00C853]">Stable</span>
        </div>
        <div className="h-3 w-px bg-[#1F2937]"></div>
        <Link className="text-[#9CA3AF] hover:text-white transition-colors" href="/privacy-policy" data-discover="true">Privacy</Link>
        <Link className="text-[#9CA3AF] hover:text-white transition-colors" href="/terms" data-discover="true">Terms</Link>
        <a className="text-[#9CA3AF] hover:text-white transition-colors" href="https://help.fomo.family/" target="_blank" rel="noopener noreferrer">Help</a>
        <a href="https://twitter.com/fomo" target="_blank" rel="noreferrer" aria-label="Fomo on X" className="group text-[#9CA3AF] transition-opacity hover:text-white">
          <svg className="h-3.5 w-3.5 transition-opacity group-hover:opacity-80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        </a>
        <a href="https://discord.gg/fomofamily" target="_blank" rel="noreferrer" aria-label="Fomo Discord" className="group text-[#9CA3AF] transition-opacity hover:text-white">
          <svg className="h-3.5 w-3.5 transition-opacity group-hover:opacity-80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <path d="M7.5 7.5c3.5-1 5.5-1 9 0"></path>
            <path d="M7 16.5c3.5 1 6.5 1 10 0"></path>
            <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"></path>
            <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.476-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5"></path>
          </svg>
        </a>
      </div>
    </footer>
  );
}
