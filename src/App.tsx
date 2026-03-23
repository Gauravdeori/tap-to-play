import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import TicTacToe from "./components/games/TicTacToe.tsx";
import RockPaperScissors from "./components/games/RockPaperScissors.tsx";
import MemoryFlip from "./components/games/MemoryFlip.tsx";
import NumberGuessing from "./components/games/NumberGuessing.tsx";
import ReactionTime from "./components/games/ReactionTime.tsx";
import SnakeGame from "./components/games/SnakeGame.tsx";
import AimTrainer from "./components/games/AimTrainer.tsx";
import TapSpeed from "./components/games/TapSpeed.tsx";
import BrickBreaker from "./components/games/BrickBreaker.tsx";
import WhackAMole from "./components/games/WhackAMole.tsx";
import ColorMatch from "./components/games/ColorMatch.tsx";
import TypingSpeed from "./components/games/TypingSpeed.tsx";
import MathSprint from "./components/games/MathSprint.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/game/tic-tac-toe" element={<TicTacToe />} />
          <Route path="/game/rps" element={<RockPaperScissors />} />
          <Route path="/game/memory" element={<MemoryFlip />} />
          <Route path="/game/number-guess" element={<NumberGuessing />} />
          <Route path="/game/reaction" element={<ReactionTime />} />
          <Route path="/game/snake" element={<SnakeGame />} />
          <Route path="/game/aim" element={<AimTrainer />} />
          <Route path="/game/tap-speed" element={<TapSpeed />} />
          <Route path="/game/brick-breaker" element={<BrickBreaker />} />
          <Route path="/game/whack-a-mole" element={<WhackAMole />} />
          <Route path="/game/color-match" element={<ColorMatch />} />
          <Route path="/game/typing-speed" element={<TypingSpeed />} />
          <Route path="/game/math-sprint" element={<MathSprint />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
