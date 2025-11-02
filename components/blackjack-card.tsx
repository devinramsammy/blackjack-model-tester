interface BlackjackCardProps {
  value: string;
  suite: string;
}

const suiteIconMap: Record<string, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

export function BlackjackCard({ value, suite }: BlackjackCardProps) {
  const suiteIcon = suiteIconMap[suite.toLowerCase()] || suite;

  return (
    <div className="w-20 h-28 border-2 border-foreground rounded-lg bg-background flex flex-col items-center justify-center relative">
      <div className="absolute top-1 left-2 flex flex-col items-center">
        <span className="text-lg font-semibold">{value}</span>
        <span className="text-xl -mt-2">{suiteIcon}</span>
      </div>
      <div className="absolute bottom-1 right-2 flex flex-col items-center rotate-180">
        <span className="text-lg font-semibold">{value}</span>
        <span className="text-xl -mt-2">{suiteIcon}</span>
      </div>
    </div>
  );
}
