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
        <div className="absolute inset-0 w-full h-full border-2 border-black rounded bg-black flex flex-col items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                white,
                white 4px,
                black 4px,
                black 8px
              )`,
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                white,
                white 4px,
                black 4px,
                black 8px
              )`,
            }}
          />
        </div>

        <div className="absolute inset-0 w-full h-full border-2 border-black rounded bg-white flex flex-col items-center justify-center backface-hidden">
          <div className="absolute top-1 left-2 flex flex-col items-center">
            <span className="text-lg font-black text-black leading-none">
              {value}
            </span>
            <span className="text-xl text-black leading-none">{suiteIcon}</span>
          </div>
          <div className="absolute bottom-1 right-2 flex flex-col items-center rotate-180">
            <span className="text-lg font-black text-black leading-none">
              {value}
            </span>
            <span className="text-xl text-black leading-none">{suiteIcon}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
