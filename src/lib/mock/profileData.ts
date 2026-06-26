export const MOCK_TRADERS = [
  { name: 'Pixel_', handle: '@Pixel_', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Pixel', winRate: '78%', followers: '12.4K' },
  { name: 'leo', handle: '@0xleo', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=leo', winRate: '64%', followers: '8.2K' },
  { name: 'remus (rtrd/acc)', handle: '@remusofmars', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=remus', winRate: '81%', followers: '45.1K' },
  { name: 'Dr Gero', handle: '@0xg3ro', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=gero', winRate: '59%', followers: '3.4K' },
  { name: 'logjam', handle: '@_logjam', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=logjam', winRate: '72%', followers: '19.8K' },
  { name: 'inyourwalls', handle: '@inyourwalls', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=inyourwalls', winRate: '68%', followers: '6.7K' },
  { name: 'SillySmallOctopus', handle: '@SillySmallOctopus', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=SillySmallOctopus', winRate: '54%', followers: '2.1K' },
  { name: 'White Russian', handle: '@WhiteRusskiye', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=WhiteRussian', winRate: '85%', followers: '67.2K' },
  { name: 'GCR Junior', handle: '@gcrJR', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=GCRJunior', winRate: '92%', followers: '142K' },
];

export const MOCK_TRADES = [
  { id: '1', token: 'BONK', action: 'Buy', amount: '$4,250', mcap: '$1.2B', time: '2m ago', positive: true },
  { id: '2', token: 'WIF', action: 'Sell', amount: '$1,800', mcap: '$890M', time: '15m ago', positive: false },
  { id: '3', token: 'POPCAT', action: 'Buy', amount: '$8,400', mcap: '$52.1M', time: '1h ago', positive: true },
  { id: '4', token: 'ASTEROID', action: 'Buy', amount: '$2,100', mcap: '$77.4M', time: '3h ago', positive: true },
  { id: '5', token: 'GOBLIN', action: 'Sell', amount: '$500', mcap: '$12.6M', time: '1d ago', positive: false },
];

export const MOCK_POSITIONS = [
  { id: '1', token: 'BONK', avgEntry: '$0.000014', currentPrice: '$0.000021', pnl: '+$2,125', percent: '+50.0%', value: '$6,375', positive: true },
  { id: '2', token: 'POPCAT', avgEntry: '$0.042', currentPrice: '$0.038', pnl: '-$800', percent: '-9.5%', value: '$7,600', positive: false },
  { id: '3', token: 'ASTEROID', avgEntry: '$1.10', currentPrice: '$1.45', pnl: '+$668', percent: '+31.8%', value: '$2,768', positive: true },
];
