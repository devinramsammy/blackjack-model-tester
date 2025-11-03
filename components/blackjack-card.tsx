export interface BlackjackCardProps {
  value: string;
  suite: string;
  faceDown: boolean;
}

const suiteIconMap: Record<string, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

export function BlackjackCard({ value, suite, faceDown }: BlackjackCardProps) {
  const suiteIcon = suiteIconMap[suite.toLowerCase()] || suite;

  if (faceDown) {
    return (
      <div className="w-20 h-28 border-2 border-black rounded bg-black flex flex-col items-center justify-center relative overflow-hidden">
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
    );
  }

  return (
    <div className="w-20 h-28 border-2 border-black rounded bg-white flex flex-col items-center justify-center relative">
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
  );
}
