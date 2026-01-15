export function BarChart({ labels, values, height = 180 }) {
  const max = Math.max(1, ...(values || [1]));
  const barWidth = 100 / Math.max(1, labels.length);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", height }}>
        {labels.map((label, i) => {
          const v = values[i] || 0;
          const h = Math.round((v / max) * (height - 24));
          return (
            <div
              key={label}
              title={`${label}: ${v}`}
              style={{
                width: `${barWidth}%`,
                padding: "0 6px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end"
              }}
            >
              <div
                style={{
                  height: h,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #00ffff, #ff00ff)",
                  boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)"
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  marginTop: 6,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LineChart({ labels, values, height = 180 }) {
  const width = 600;
  const padding = 24;
  const max = Math.max(1, ...(values || [1]));
  const min = 0;

  const points = (labels || []).map((_, i) => {
    const x =
      padding +
      (i * (width - padding * 2)) / Math.max(1, (labels.length - 1));
    const v = values[i] || 0;
    const y =
      padding +
      (1 - (v - min) / (max - min || 1)) * (height - padding * 2);
    return { x, y, v };
  });

  const d = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Trend chart"
    >
      <defs>
        <linearGradient id="trend" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="100%" stopColor="#ff00ff" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#trend)" strokeWidth="3" style={{ filter: "drop-shadow(0 0 4px rgba(0, 255, 255, 0.6))" }} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ff00ff" style={{ filter: "drop-shadow(0 0 4px rgba(255, 0, 255, 0.8))" }}>
          <title>
            {labels[i]}: {p.v}
          </title>
        </circle>
      ))}
    </svg>
  );
}
