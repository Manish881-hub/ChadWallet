import Image from "next/image";

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
            width={1400}
            height={1400}
            className="
              absolute
              opacity-30
              animate-[spin_60s_linear_infinite]
            "
          />

          <Image
            src="/flow/inner-circle.webp"
            alt=""
            width={1050}
            height={1050}
            className="
              absolute
              opacity-30
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

          <div className="mt-10 flex gap-4">
            <button
              className="
                px-10
                h-[64px]
                rounded-2xl
                bg-[#5B5CEB]
                text-white
                font-semibold
              "
            >
              Start Trading
            </button>

            <button
              className="
                px-10
                h-[64px]
                rounded-2xl
                bg-white/10
                backdrop-blur-md
                text-white
                font-semibold
              "
            >
              Download App
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
