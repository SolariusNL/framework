import { useState } from "react";

interface ClickToRevealProps {
  children: React.ReactNode;
  hiddenType: "blur" | "solid";
  blurStrength?: number;
  solidColor?: string;
}

const ClickToReveal: React.FC<
  ClickToRevealProps & React.HTMLAttributes<HTMLDivElement>
> = ({ children, hiddenType, blurStrength, solidColor, ...props }) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <div
      onClick={() => setRevealed(!revealed)}
      style={{
        position: "relative",
        filter: revealed
          ? "none"
          : hiddenType === "blur"
          ? `blur(${blurStrength}px)`
          : "none",
        backgroundColor: revealed
          ? "none"
          : hiddenType === "solid"
          ? solidColor
          : "none",
        cursor: "pointer",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default ClickToReveal;
