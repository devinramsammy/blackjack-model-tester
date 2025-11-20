export interface BlackjackCardType {
  value: string;
  suite: string;
  faceDown: boolean;
}

export interface CutCardType {
  type: "cut";
}

const suiteIconMap: Record<string, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

export function BlackjackCard({ value, suite, faceDown }: BlackjackCardType) {
  const suiteIcon = suiteIconMap[suite.toLowerCase()] || suite;

  return (
    <div className="w-20 h-28 perspective-distant">
      <div
        className="relative w-full h-full transition-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: faceDown ? "rotateY(180deg)" : "rotateY(0deg)",
          transitionDuration: "0.4s",
          transitionTimingFunction: "ease-in-out",
        }}
      >
        <div className="absolute inset-0 w-full h-full border-2 border-black bg-black flex flex-col items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 6px,
                  #ffffff 6px,
                  #ffffff 8px
                ),
                repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 6px,
                  #ffffff 6px,
                  #ffffff 8px
                )
              `,
              opacity: 0.4,
            }}
          />
        </div>

        <div className="absolute inset-0 w-full h-full border-2 border-black bg-white flex flex-col items-center justify-center backface-hidden">
          <div className="absolute top-1 left-2 flex flex-col items-center">
            <span className="text-lg font-bold text-black leading-none font-mono">
              {value}
            </span>
            <span className="text-xl text-black leading-none">{suiteIcon}</span>
          </div>
          <div className="absolute bottom-1 right-2 flex flex-col items-center rotate-180">
            <span className="text-lg font-bold text-black leading-none font-mono">
              {value}
            </span>
            <span className="text-xl text-black leading-none">{suiteIcon}</span>
          </div>
          <div className="text-3xl text-black font-bold">{suiteIcon}</div>
        </div>
      </div>
    </div>
  );
}
