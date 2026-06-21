import TokenBanner from '@/components/TokenBanner';
import Footer from '@/components/Footer';
import SignInButton from '@/components/SignInButton'; // simple button using usePrivy

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <TokenBanner position="top" />
      <section className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <img src="/chadwallet-logo.svg" alt="ChadWallet" className="w-40 mb-8" />
        <h1 className="text-5xl font-black neon-text">Trade Like a Chad</h1>
        <p className="mt-4 text-xl max-w-xl">
          The meme‑powered trading terminal for Solana. Discover trending tokens, swap instantly.
        </p>
        <div className="mt-8 flex gap-4">
          <SignInButton />
          <a
            href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
            target="_blank"
            className="bg-green-500 px-6 py-3 rounded-xl font-bold"
          >
            Get the App
          </a>
        </div>
      </section>
      <TokenBanner position="bottom" />
      <Footer />
    </main>
  );
}