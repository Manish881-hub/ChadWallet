'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const { addToast } = useToast();

  const handleWithdraw = () => {
    if (!address || !amount) {
      addToast('Please enter address and amount', 'error');
      return;
    }
    // Fake withdraw
    addToast(`Withdrew ${amount} SOL successfully`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-[#111111] border border-[#1F1F1F] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F]">
            <h2 className="text-lg font-bold text-white">Withdraw SOL</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-[#A0A0A0] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#A0A0A0]">Recipient Address</label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Solana address"
                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4D62FF]/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                 <label className="text-xs font-bold text-[#A0A0A0]">Amount (SOL)</label>
                 <span className="text-[10px] text-[#555]">Balance: 4.20 SOL</span>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4D62FF]/50 transition-colors"
                />
                <button onClick={() => setAmount('4.20')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#4D62FF] hover:text-white transition-colors bg-[#4D62FF]/10 px-2 py-0.5 rounded">
                  MAX
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#1F1F1F] flex justify-end gap-3 bg-[#0A0A0A]">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleWithdraw} className="px-5 py-2 text-sm font-bold text-white bg-[#4D62FF] hover:bg-[#3D52E5] rounded-lg transition-colors shadow-lg">
              Confirm Withdraw
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
