import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="flex items-start gap-3">
            <Image src="/logo/dark.png" alt="ChadWallet" width={28} height={28} className="w-7 h-7 mt-1 shrink-0" />
            <div>
              <p className="text-white font-bold">ChadWallet</p>
              <p className="text-sm text-secondary-text mt-1">where traders become legends.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-12">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">About</h4>
              <ul className="space-y-3">
                <li><a href="/blog" className="text-sm text-secondary-text hover:text-white transition-colors">Blog</a></li>
                <li><a href="/faq" className="text-sm text-secondary-text hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/affiliates" className="text-sm text-secondary-text hover:text-white transition-colors">Affiliates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Social</h4>
              <ul className="space-y-3">
                <li><a href="https://discord.gg/chadwallet" target="_blank" className="text-sm text-secondary-text hover:text-white transition-colors">Discord</a></li>
                <li><a href="https://x.com/chadwallet" target="_blank" className="text-sm text-secondary-text hover:text-white transition-colors">X / Twitter</a></li>
                <li><a href="https://instagram.com/chadwallet" target="_blank" className="text-sm text-secondary-text hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-sm text-secondary-text hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-sm text-secondary-text hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">© 2026 ChadWallet. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <svg className="w-6 h-auto opacity-30" viewBox="0 0 40 24" fill="none">
              <rect x="0.5" y="0.5" width="39" height="23" rx="3.5" stroke="#9CA3AF" />
              <circle cx="20" cy="13" r="5" fill="#9CA3AF" opacity="0.3" />
            </svg>
            <svg className="w-8 h-auto opacity-30" viewBox="0 0 56 24" fill="none">
              <rect x="0.5" y="0.5" width="55" height="23" rx="3.5" stroke="#9CA3AF" />
              <circle cx="20" cy="12" r="7" fill="#9CA3AF" opacity="0.3" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
