"use client";

import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { motion } from "framer-motion";

const features = [
  {
    label: "LEADERBOARD",
    title: "become a legend, top the leaderboard",
    image: "/appstore/kol.png",
    accent: "#f59e0b",
  },
  {
    label: "FEED",
    title: "discover and follow top traders",
    image: "/appstore/discover.png",
    accent: "#3b82f6",
  },
  {
    label: "ALERTS",
    title: "real time notifications for what the best are buying",
    image: "/appstore/x.png",
    accent: "#a855f7",
  },
  {
    label: "EASY ONBOARDING",
    title: "create an account in an instant",
    image: "/appstore/splash.png",
    accent: "#22c55e",
  },
  {
    label: "ZERO COMPLEXITY",
    title: "multichain & gasless",
    image: "/appstore/token.png",
    accent: "#06b6d4",
  },
  {
    label: "ONE CLICK TO BUY",
    title: "fund with apple pay",
    image: "/appstore/deposit.png",
    accent: "#ec4899",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const CARD_GAP = 200;
const ACTIVE_SCALE = 1;
const INACTIVE_SCALE = 0.82;
const ANIMATION_SPEED = 0.48;
const BORDER_RADIUS = 36;

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(1200);
  const [activeIndex, setActiveIndex] = useState(() => Math.floor(features.length / 2));

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setFrameWidth(el.getBoundingClientRect().width || 1200);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isMobile = frameWidth < 640;
  const cardSize = isMobile
    ? clamp(frameWidth * 0.78, 220, 340)
    : clamp(Math.min(frameWidth * 0.28, 380), 260, 380);
  const spacing = isMobile ? cardSize * 0.88 : CARD_GAP;

  const goTo = useCallback((i: number) => setActiveIndex(clamp(i, 0, features.length - 1)), []);
  const prev = useCallback(() => setActiveIndex((c) => (c === 0 ? features.length - 1 : c - 1)), []);
  const next = useCallback(() => setActiveIndex((c) => (c === features.length - 1 ? 0 : c + 1)), []);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      const threshold = isMobile ? 36 : 56;
      if (info.offset.x > threshold) prev();
      else if (info.offset.x < -threshold) next();
    },
    [isMobile, prev, next]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  return (
    <section className="relative pt-12 pb-24 sm:pt-20 sm:pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-left mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white ">
            never miss out again
          </h2>
          <p className="mt-2 text-xl text-[#EAEDFF99]">
            the only social-first trading app
          </p>
        </div>

        {/* Carousel */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            width: "100%",
            height: isMobile ? cardSize + 48 : cardSize + 80,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={handleDragEnd}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "visible",
              touchAction: "pan-y",
            }}
          >
            {features.map((feature, index) => {
              const isActive = index === activeIndex;
              const distance = index - activeIndex;
              const absDistance = Math.abs(distance);
              const x = distance * spacing;
              const scale = isActive ? ACTIVE_SCALE : INACTIVE_SCALE;

              return (
                <motion.div
                  key={feature.label}
                  role={isActive ? "group" : "button"}
                  tabIndex={isActive ? -1 : 0}
                  aria-label={isActive ? feature.label : `Show slide ${index + 1}`}
                  onClick={() => !isActive && goTo(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(index); }
                  }}
                  animate={{
                    x,
                    scale,
                    opacity: absDistance > 2 ? 0.4 : 1,
                  }}
                  transition={{
                    duration: ANIMATION_SPEED,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: cardSize,
                    height: cardSize,
                    marginLeft: -cardSize / 2,
                    marginTop: -cardSize / 2,
                    transformOrigin: "center",
                    zIndex: isActive ? 50 : 50 - absDistance,
                    cursor: isActive ? "default" : "pointer",
                    overflow: "hidden",
                    borderRadius: BORDER_RADIUS,
                    border: `${isActive ? 1.5 : 1}px solid ${isActive ? feature.accent + "55" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isActive
                      ? `0 0 0 1px ${feature.accent}22, 0 32px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.3)`
                      : "0 6px 18px rgba(0,0,0,0.25)",
                    boxSizing: "border-box",
                    background: isActive ? "rgba(6, 10, 26, 0.8)" : "rgba(6, 10, 26, 0.2)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    outline: "none",
                  }}
                >
                  {/* Background image */}
                  <img
                    src={feature.image}
                    alt={feature.label}
                    draggable={false}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      display: "block",
                      userSelect: "none",
                      transition: `transform ${ANIMATION_SPEED}s ease, opacity ${ANIMATION_SPEED}s ease`,
                      transform: isActive ? "scale(1.04)" : "scale(1)",
                      opacity: isActive ? 1 : 0.6,
                      mixBlendMode: isActive ? "normal" : "screen",
                    }}
                  />

                  {/* Dark gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: isActive
                        ? `linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.28) 55%, transparent 100%)`
                        : `linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)`,
                      transition: `opacity ${ANIMATION_SPEED}s ease`,
                    }}
                  />

                  {/* Active card content */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: ANIMATION_SPEED * 0.7,
                        delay: ANIMATION_SPEED * 0.12,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: isMobile ? 24 : 32,
                        pointerEvents: "none",
                      }}
                    >
                      {/* Accent pill */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          alignSelf: "flex-start",
                          padding: "4px 12px",
                          borderRadius: 999,
                          background: feature.accent + "22",
                          border: `1px solid ${feature.accent}55`,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            color: feature.accent,
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 700,
                            fontFamily: "monospace",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                          }}
                        >
                          {feature.label}
                        </span>
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          color: "#ffffff",
                          fontSize: isMobile ? clamp(cardSize * 0.075, 18, 26) : clamp(cardSize * 0.072, 20, 28),
                          fontWeight: 700,
                          letterSpacing: "-0.025em",
                          lineHeight: 1.1,
                          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                        }}
                      >
                        {feature.title}
                      </h3>
                    </motion.div>
                  )}

                  {/* Inactive label */}
                  {!isActive && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 20,
                        left: 20,
                        right: 20,
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "monospace",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {feature.label}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Dot indicators */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: isMobile ? 28 : 40,
          }}
        >
          {features.map((f, i) => (
            <button
              key={f.label}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: i === activeIndex ? 24 : 7,
                height: 7,
                border: "none",
                borderRadius: 999,
                padding: 0,
                backgroundColor: i === activeIndex ? features[activeIndex].accent : "rgba(255,255,255,0.2)",
                opacity: i === activeIndex ? 1 : 1,
                cursor: "pointer",
                transition: `width ${ANIMATION_SPEED}s ease, background-color ${ANIMATION_SPEED}s ease`,
              }}
            />
          ))}
        </div>

        {/* Arrow buttons — desktop only */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 24,
            }}
          >
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prev}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s, border-color 0.2s",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              }}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s, border-color 0.2s",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
