'use client';
import { useState } from 'react';
import { useProfile, ProfileState } from '@/lib/ProfileContext';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { profile, updateProfile } = useProfile();
  const { addToast } = useToast();

  if (!isOpen) return null;

  return (
    <EditProfileForm
      addToast={addToast}
      onClose={onClose}
      profile={profile}
      updateProfile={updateProfile}
    />
  );
}

function profileToFormData(profile: ProfileState): Partial<ProfileState> {
  return {
    username: profile.username,
    bio: profile.bio,
    twitter: profile.twitter,
    website: profile.website,
    avatar: profile.avatar,
    banner: profile.banner,
  };
}

function EditProfileForm({
  addToast,
  onClose,
  profile,
  updateProfile,
}: {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onClose: () => void;
  profile: ProfileState;
  updateProfile: (updates: Partial<ProfileState>) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Partial<ProfileState>>(() => profileToFormData(profile));

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      addToast('Profile updated', 'success');
      onClose();
    } catch {
      addToast('Profile saved locally', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#111111] border border-[#1F1F1F] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F]">
            <h2 className="text-lg font-bold text-white">Edit Profile</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-[#A0A0A0] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="p-4 overflow-y-auto scrollbar-thin flex flex-col gap-4">
            
            {/* Banner Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#A0A0A0]">Banner Image</label>
              <div className="relative h-24 rounded-lg bg-[#1F1F1F] border border-[#333] flex items-center justify-center overflow-hidden group cursor-pointer">
                {formData.banner ? (
                  <img src={formData.banner} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Banner" />
                ) : (
                  <span className="text-xs text-[#888]">Click to upload banner</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full font-medium">Upload</span>
                </div>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'banner')} />
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#A0A0A0]">Avatar Image</label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-[#1F1F1F] border border-[#333] flex items-center justify-center overflow-hidden group cursor-pointer shrink-0">
                  {formData.avatar ? (
                    <img src={formData.avatar} className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" alt="Avatar" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#888]" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'avatar')} />
                </div>
                <div className="flex-1 text-xs text-[#9CA3AF]">
                  Recommended size: 400x400px. JPG, PNG or GIF.
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#A0A0A0]">Username</label>
              <input 
                type="text" 
                value={formData.username || ''} 
                onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4D62FF]/50 transition-colors"
                placeholder="ChadTrader99"
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#A0A0A0]">Bio</label>
              <textarea 
                value={formData.bio || ''} 
                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4D62FF]/50 transition-colors resize-none h-20"
                placeholder="What's on your mind?"
              />
            </div>
            
            {/* Links */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#A0A0A0]">Twitter (X)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-sm">@</span>
                  <input 
                    type="text" 
                    value={formData.twitter || ''} 
                    onChange={(e) => setFormData(p => ({ ...p, twitter: e.target.value }))}
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#4D62FF]/50 transition-colors"
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#A0A0A0]">Website</label>
                <input 
                  type="text" 
                  value={formData.website || ''} 
                  onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4D62FF]/50 transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

          </div>

          <div className="p-4 border-t border-[#1F1F1F] flex justify-end gap-3 bg-[#0A0A0A]">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-5 py-2 text-sm font-bold text-white bg-white text-black hover:bg-gray-200 rounded-lg transition-colors shadow-lg">
              Save Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
