import { Link } from "react-router";
import {
  ArrowRightIcon,
  CheckIcon,
  Code2Icon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
} from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";

function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-20">
        <section className="glass-hero mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 text-sm text-gray-600 dark:text-gray-300">Real-time Collaboration</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white">
            Collaborative coding interviews and live problem-solving
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Practice curated and admin-created problems, run live pair‑programming sessions with a shared editor, and collaborate via real‑time chat.
          </p>

          <div className="flex items-center justify-center gap-4">
            <SignInButton mode="modal">
              <button className="primary-black-btn">Get Started</button>
            </SignInButton>

            <button className="btn btn-ghost">Watch Demo</button>
          </div>
        </section>

        <section className="mt-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="neumo p-6">
              <div className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Practice Problems</div>
              <p className="text-gray-600 dark:text-gray-300">Solve curated problems or admin-created challenges with starter code and difficulty metadata.</p>
            </div>
            <div className="neumo p-6">
              <div className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Live Coding Sessions</div>
              <p className="text-gray-600 dark:text-gray-300">Invite collaborators with a session code and work together in a shared, real‑time code editor.</p>
            </div>
            <div className="neumo p-6">
              <div className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Real-time Chat</div>
              <p className="text-gray-600 dark:text-gray-300">In-session messaging powered by Socket.IO for instant collaboration and contextual discussion.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Made with <span aria-hidden="true">❤️</span> by Tejas_Rastogi
      </footer>
    </div>
  );
}
export default HomePage;
