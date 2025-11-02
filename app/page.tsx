import { BlackjackCard } from "@/components/blackjack-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-4">shadcn next.js</h1>
        <div className="flex gap-4 flex-wrap">
          <BlackjackCard value="A" suite="hearts" />
          <BlackjackCard value="K" suite="spades" />
          <BlackjackCard value="Q" suite="diamonds" />
          <BlackjackCard value="J" suite="clubs" />
          <BlackjackCard value="10" suite="hearts" />
        </div>
      </main>
    </div>
  );
}
