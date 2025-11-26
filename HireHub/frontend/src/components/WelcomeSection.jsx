import { useUser, SignInButton } from "@clerk/clerk-react";
import { ArrowRightIcon, SparklesIcon, ZapIcon } from "lucide-react";

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();

  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto px-6 py-12 glass-hero">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold">
                Welcome back, {user?.firstName || "there"}!
              </h2>
            </div>
            <p className="text-gray-600">Ready to evaluate candidates with confidence?</p>
          </div>

          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <button className="primary-black-btn">Get Started</button>
            </SignInButton>
            <button onClick={onCreateSession} className="btn btn-ghost smooth">Create Session</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
