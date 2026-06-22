import Image from "next/image";
import Link from "next/link";

export default function CommunitySection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[1400px] w-full">
        <Image
          src="/flow/legends.webp"
          alt=""
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/20" />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-[#2E3192]/30
            via-transparent
            to-[#040611]
          "
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
            src="/flow/outer-circle.webp"
            alt=""
            width={1000}
            height={1000}
            className="
              absolute
              opacity
              animate-[spin_60s_linear_infinite]
            "
          />

          <Image
            src="/flow/inner-circle.webp"
            alt=""
            width={650}
            height={650}
            className="
              absolute
              opacity
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
          <h2
            className="
              text-center
              text-white
              text-[72px]
              leading-[72px]
              md:text-[92px]
              md:leading-[92px]
              tracking-[-0.04em]
              font-bold
            "
          >
            a trading app
            <br />
            for the rest of us
          </h2>

          <p
            className="
              mt-6
              text-center
              text-[22px]
              text-[#A4A9C6]
              font-medium
            "
          >
            join 500,000 traders making their name on ChadWallet
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/trade"
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
