import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="px-10 pt-8 pb-12 flex flex-col md:flex-row gap-10 items-start justify-between bg-[#040611]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start">
          <h3 className="text-white font-bold text-[48px] tracking-[-0.04em] leading-none mb-2">
            ChadWallet
          </h3>
          <p className="text-[20px] text-[#A4A9C6] tracking-tight">
            where traders become legends.
          </p>
        </div>
        <div className="text-muted hidden md:block">
          © 2026 ChadWallet Inc.
        </div>
      </div>

      <div className="flex items-start flex-col md:flex-row gap-8 md:gap-2">
        <div className="flex flex-col items-start gap-2 min-w-40">
          <div className="text-muted font-mono text-sm">ABOUT</div>
          <a className="text-sm text-secondary-text hover:text-white" href="/blog" data-discover="true">Blog</a>
          <a className="text-sm text-secondary-text hover:text-white" href="/answers" data-discover="true">FAQ</a>
          <a className="text-sm text-secondary-text hover:text-white" href="/affiliates" data-discover="true">Affiliates</a>
        </div>
        
        <div className="flex flex-col items-start gap-2 min-w-40">
          <div className="text-muted font-mono text-sm">SOCIAL</div>
          <a href="https://discord.gg/fomofamily" className="text-sm text-secondary-text hover:text-white" target="_blank" rel="noopener noreferrer">Discord</a>
          <a href="https://x.com/fomo" className="text-sm text-secondary-text hover:text-white" target="_blank" rel="noopener noreferrer">X/Twitter</a>
          <a href="https://www.instagram.com/tryfomo" className="text-sm text-secondary-text hover:text-white" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.youtube.com/channel/UCQAgxFZYN2GhYKrXG4ypnUg" className="text-sm text-secondary-text hover:text-white" target="_blank" rel="noopener noreferrer">Youtube</a>
          <a href="https://www.linkedin.com/company/tryfomo/" className="text-sm text-secondary-text hover:text-white" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>

        <div className="flex flex-col items-start gap-2 min-w-40">
          <div className="text-muted font-mono text-sm">LEGAL</div>
          <a className="text-sm text-secondary-text hover:text-white" href="/privacy-policy" data-discover="true">Privacy Policy</a>
          <a className="text-sm text-secondary-text hover:text-white" href="/terms" data-discover="true">Terms of Service</a>
        </div>
      </div>
      
      <div className="text-muted block md:hidden">
        © 2026 ChadWallet Inc.
      </div>
    </footer>
  );
}
