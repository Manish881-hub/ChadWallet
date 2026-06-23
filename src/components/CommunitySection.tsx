import Image from "next/image";
import Link from "next/link";

export default function CommunitySection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[700px] sm:h-[900px] md:h-[1100px] lg:h-[1400px] w-full">
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-[#050816]
            via-[#2E3192]/20
            to-[#040611]
          "
        />

        <div className="absolute inset-0 bg-black/20" />

        <Image
          src="/landingpage/legends.webp"
          alt=""
          fill
          className="object-cover"
          style={{
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
          }}
          priority
        />

        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
          "
        >
          <Image
            src="/landingpage/outer-circle.webp"
            alt=""
            width={1000}
            height={1000}
            className="
              w-[80vw]
              max-w-[320px]
              sm:max-w-[480px]
              md:max-w-[680px]
              lg:max-w-[1000px]
              h-auto
              absolute
              animate-[spin_60s_linear_infinite]
            "
          />

          <Image
            src="/landingpage/inner-circle.webp"
            alt=""
            width={650}
            height={650}
            className="
              w-[55vw]
              max-w-[220px]
              sm:max-w-[320px]
              md:max-w-[460px]
              lg:max-w-[650px]
              h-auto
              absolute
              animate-spin-reverse
            "
          />
        </div>

        <div
          className="
            relative
            z-20
            flex
            flex-col
            items-center
            justify-center
            h-full
          "
        >
          <h1
            className="
              text-center
              text-white
              text-[44px]
              leading-[1.05]
              sm:text-[56px]
              md:text-[72px]
              md:leading-[72px]
              lg:text-[92px]
              lg:leading-[92px]
              tracking-[-0.04em]
              font-bold
              px-4
            "
          >
            a trading app
            <br />
            for the rest of us
          </h1>

          <p
            className="
              mt-6
              text-center
              text-[18px]
              sm:text-[20px]
              md:text-[22px]
              text-[#A4A9C6]
              font-medium
              px-6
            "
          >
            join 500,000 traders making their name on ChadWallet
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 px-6">
            <Link
              href="/trade/So11111111111111111111111111111111111111112"
              className="inline-flex items-center justify-center bg-[#5c67d6] hover:bg-[#4a55a2] text-white font-semibold px-8 py-3.5 rounded-2xl transition-all"
            >
              Start trading
            </Link>

            <a
              href="#"
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl border border-white/10 transition-all"
            >
              Download app
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
