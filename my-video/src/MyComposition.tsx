import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1712" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity,
        }}
      >
        <h1
          style={{
            fontSize: 80,
            color: "#faf6ef",
            fontFamily: "serif",
            textAlign: "center",
            margin: 0,
          }}
        >
          Welcome to Remotion
        </h1>
      </div>
    </AbsoluteFill>
  );
};
