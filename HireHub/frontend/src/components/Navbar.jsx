import { Link, useLocation } from "react-router";
import { SparklesIcon } from "lucide-react";
import { SignInButton, useUser, UserButton } from "@clerk/clerk-react";
import DarkModeToggle from "./DarkModeToggle";
import { sessionApi } from "../api/sessions";
import toast from "react-hot-toast";
import { useState } from "react";
import { useEffect } from "react";

// admin link is shown when user's clerk id is included in VITE_ADMIN_CLERK_IDS
const adminCsv = import.meta.env.VITE_ADMIN_CLERK_IDS || "";
const ADMIN_IDS = adminCsv.split(",").map((s) => s.trim()).filter(Boolean);

function Navbar() {
  const location = useLocation();

  const { user } = useUser();

  const isActive = (path) => location.pathname === path;
  const isAdmin = !!user && ADMIN_IDS.includes(user.id);
  // Copy ID removed per user preference

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center">

        {/* Left: Logo + brand (aligned to left edge) */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div className="ml-2">
              <div className="text-xl md:text-2xl font-extrabold">HireBoard</div>
              <div className="text-sm text-gray-500">Code Together</div>
            </div>
          </Link>
        </div>

        {/* Center: Navigation links - centered on all screen sizes */}
        <nav className="flex-1 flex items-center justify-center gap-6 px-4">
          <Link to="/problems" className="text-sm text-gray-700 hover:text-black smooth">Problems</Link>
          <Link to="/dashboard" className="text-sm text-gray-700 hover:text-black smooth">Dashboard</Link>
          {isAdmin && <Link to="/admin" className="text-sm text-gray-700 hover:text-black smooth">Admin</Link>}
        </nav>

        {/* Right: Controls (dark toggle + user/avatar + admin actions) */}
        <div className="flex items-center gap-4 ml-2">
          <DarkModeToggle />

          {isAdmin && (
            <EndAllButton />
          )}

          {user ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10 rounded-full",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button className="primary-black-btn">Get Started</button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
function EndAllButton() {
  const [isPending, setIsPending] = useState(false);
  const [previewCount, setPreviewCount] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await sessionApi.previewEndAll();
        if (!mounted) return;
        setPreviewCount(res.count ?? 0);
      } catch (err) {
        console.debug("previewEndAll failed", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleEndAll = async () => {
    if (!confirm("End ALL active sessions? This will close all live sessions and cannot be undone.")) return;
    try {
      setIsPending(true);
      const res = await sessionApi.endAllSessions();
      toast.success(`Processed ${res.results?.length || 0} sessions`);
    } catch (err) {
      console.error("endAllSessions failed", err);
      toast.error("Failed to end all sessions");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-gray-600">{previewCount !== null ? `${previewCount} active` : "—"}</div>
      <button onClick={handleEndAll} className="btn btn-sm btn-error" disabled={isPending} title="End all active sessions">
        {isPending ? "Ending..." : "End All Sessions"}
      </button>
    </div>
  );
}

export default Navbar;
