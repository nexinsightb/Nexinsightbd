import "@/themes/DarkGoldTheme/theme.css";

/**
 * Loading skeleton shown while the restaurant page data resolves.
 * Uses the same design tokens as the full page.
 */
export default function RestaurantLoading() {
  return (
    <div className="rp-root">
      <div className="rp-page">
        {/* Header skeleton */}
        <div className="rp-header">
          <div
            style={{
              width: 180,
              height: 64,
              borderRadius: 12,
              background: "#1d232a",
              animation: "rpPulse 1.4s ease-in-out infinite",
            }}
          />
        </div>

        {/* Feedback headline skeleton */}
        <div className="rp-feedback">
          <div
            style={{
              width: 260,
              height: 40,
              borderRadius: 8,
              background: "#1d232a",
              animation: "rpPulse 1.4s ease-in-out infinite",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 12,
            }}
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 130,
                  height: 48,
                  borderRadius: 50,
                  background: "#1d232a",
                  animation: "rpPulse 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Carousel skeleton */}
        <div className="rp-dish-wrap">
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              aspectRatio: "4/3",
              borderRadius: 16,
              background: "#1d232a",
              animation: "rpPulse 1.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes rpPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
