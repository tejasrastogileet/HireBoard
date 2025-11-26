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
          <div className="mb-4 inline-block px-3 py-1 rounded-full bg-white/60 text-sm text-gray-600">Real-time Collaboration</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            Empower your hiring with collaborative technical interviews
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            HireBoard helps teams evaluate candidates through live code sessions, video collaboration, and structured problems.
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
              <div className="text-xl font-semibold mb-2">HD Video Call</div>
              <p className="text-gray-600">Crystal clear video and audio for interviews.</p>
            </div>
            <div className="neumo p-6">
              <div className="text-xl font-semibold mb-2">Live Code Editor</div>
              <p className="text-gray-600">Collaborate in real-time with syntax highlighting.</p>
            </div>
            <div className="neumo p-6">
              <div className="text-xl font-semibold mb-2">Easy Collaboration</div>
              <p className="text-gray-600">Share screens, discuss, and learn together.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default HomePage;
