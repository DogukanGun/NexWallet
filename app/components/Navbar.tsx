"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buttonClass } from "./ButtonClass";
import { useAppKitAccount } from "../config";
import WalletButton from "./WalletButton";
import TelegramNoticeModal from './TelegramNoticeModal';
import RoadmapModal from './RoadmapModal';
import { useState } from "react";

const Navbar = () => {
  const path = usePathname();
  const { isConnected } = useAppKitAccount();
  const router = useRouter();
  const [showTelegramNotice, setShowTelegramNotice] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  return (
    <div className="drawer">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar backdrop-blur-md bg-black/30 border-b border-gray-700/50 text-white shadow-lg w-full fixed top-0 z-50">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost text-white hover:bg-orange-500/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          
          <div className="mx-2 flex-1 px-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                Nexarb
              </span>
            </Link>
          </div>

          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal flex items-center px-4 py-2 gap-4">
              {path === "/" && (
                <li className="flex items-center">
                  <Link
                    href="/app"
                    className="px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full shadow-[0_0_15px_rgba(251,146,60,0.5)] hover:shadow-[0_0_20px_rgba(251,146,60,0.7)] transition-all duration-300"
                  >
                    Launch NexWallet
                  </Link>
                </li>
              )}
              <li className="flex items-center">
                <button
                  onClick={() => setShowTelegramNotice(true)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] transition-all duration-300"
                >
                  Add to Telegram
                </button>
              </li>
              <li className="flex items-center">
                <button
                  onClick={() => setShowRoadmap(true)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] transition-all duration-300"
                >
                  Roadmap
                </button>
              </li>
              {path !== "/" && (
                <li className="flex items-center">
                  <WalletButton />
                </li>
              )}
              {path !== '/' && path !== '/app' && (
                <li className="flex items-center">
                  <button
                    onClick={() => router.push('/app')}
                    className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-full border border-gray-700 hover:border-orange-500/50 transition-all duration-300"
                  >
                    Go Back to App
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Sidebar */}
      {isConnected && (
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-3"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="menu min-h-full w-80 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800/50 p-4">
            <div className="flex flex-col gap-4">
              {path === "/" && (
                <>
                  <Link
                    href="/voice"
                    className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/20 transition duration-300 text-center"
                  >
                    Launch App with Voice
                  </Link>
                  <Link
                    href="/chat"
                    className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl border border-gray-700 hover:border-orange-500/50 transition duration-300 text-center"
                  >
                    Launch App with Chat
                  </Link>
                </>
              )}
              {path === "/chat" && (
                <Link
                  href="/voice"
                  className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/20 transition duration-300 text-center"
                >
                  Switch to Voice
                </Link>
              )}
              {path === "/voice" && (
                <Link
                  href="/chat"
                  className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/20 transition duration-300 text-center"
                >
                  Switch to Chat
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add the modals */}
      <TelegramNoticeModal
        isOpen={showTelegramNotice}
        onClose={() => setShowTelegramNotice(false)}
        onViewRoadmap={() => setShowRoadmap(true)}
      />

      <RoadmapModal
        isOpen={showRoadmap}
        onClose={() => setShowRoadmap(false)}
      />
    </div>
  );
};

export default Navbar;
