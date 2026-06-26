'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import { usePrivy } from '@privy-io/react-auth';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { user } = usePrivy();
  const { addToast } = useToast();
  
  const walletAddress = user?.wallet?.address || 'E3aF...9q2L';

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    addToast('Address copied to clipboard', 'success');
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
            <h2 className="text-lg font-bold text-white">Deposit</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-[#A0A0A0] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="p-6 flex flex-col items-center gap-6">
            <div className="w-48 h-48 bg-white rounded-xl p-2">
              {/* Fake QR Code */}
              <div className="w-full h-full border-4 border-black border-dashed flex items-center justify-center text-black font-bold">
                QR CODE
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <span className="text-xs text-[#A0A0A0] text-center font-bold">Your Solana Address</span>
              <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#1F1F1F] p-2 rounded-lg">
                <span className="flex-1 text-sm text-white font-mono truncate">{walletAddress}</span>
                <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded transition-colors text-[#39FF14]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
              <p className="text-[10px] text-[#555] text-center mt-2">Only send SOL or SPL tokens to this address.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
