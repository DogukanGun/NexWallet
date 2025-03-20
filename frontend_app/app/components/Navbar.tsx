"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buttonClass } from "./ButtonClass";
import { useAppKitAccount } from "@reown/appkit/react";
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

  // Add function to close drawer
  const closeDrawer = () => {
    const drawer = document.getElementById('my-drawer-3') as HTMLInputElement;
    if (drawer) {
      drawer.checked = false;
    }
  };

  // Add function to handle Telegram button click
  const handleTelegramClick = () => {
    closeDrawer();
    setShowTelegramNotice(true);
  };

  // Add function to handle Roadmap button click
  const handleRoadmapClick = () => {
    closeDrawer();
    setShowRoadmap(true);
  };

  // Add function to handle navigation
  const handleNavigation = (route: string) => {
    closeDrawer();
    router.push(route);
  };

  return (
    <div className="drawer">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle hidden z-[200]" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar h-20 backdrop-blur-md bg-black/30 text-white shadow-lg w-full fixed top-0 z-50">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost text-white hover:bg-orange-500/20"
              onClick={() => setShowTelegramNotice(false)}
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
            <ul className="menu menu-horizontal flex items-center px-4 gap-3">
              {path === "/" && (
                <li>
                  <Link
                    href="/app"
                    className="nav-button bg-gradient-to-r from-orange-400 to-pink-500"
                  >
                    Launch NexWallet
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={handleTelegramClick}
                  className="nav-button bg-gradient-to-r from-blue-400 to-blue-500 relative"
                >
                  Chat in Telegram
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-xs px-1.5 py-0.5 rounded-full font-semibold">BETA</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowRoadmap(true)}
                  className="nav-button bg-gradient-to-r from-purple-400 to-pink-500"
                >
                  Roadmap
                </button>
              </li>
              {path !== "/" && (
                <li>
                  <WalletButton />
                </li>
              )}
              {path !== '/' && path !== '/app' && (
                <li>
                  <button
                    onClick={() => router.push('/app')}
                    className="nav-button bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-orange-500/50"
                  >
                    Go Back to App
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
        {/* Add a spacer to prevent content from hiding under navbar */}
        <div className="h-20"></div>
      </div>
      
      {/* Sidebar - update mobile buttons to match desktop */}
      <div className="drawer-side lg:hidden z-[100]">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="menu min-h-full w-80 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800/50 p-4">
          <div className="flex justify-end mb-4">
            <label
              htmlFor="my-drawer-3"
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
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </label>
          </div>
          
          <div className="flex flex-col gap-3">
            {path === "/" && (
              <Link
                href="/app"
                onClick={() => closeDrawer()}
                className="mobile-nav-button bg-gradient-to-r from-orange-400 to-pink-500"
              >
                Launch NexWallet
              </Link>
            )}
            <button
              onClick={handleTelegramClick}
              className="mobile-nav-button bg-gradient-to-r from-blue-400 to-blue-500 relative"
            >
              Chat in Telegram
              <span className="absolute -top-2 -right-2 bg-pink-500 text-xs px-1.5 py-0.5 rounded-full font-semibold">BETA</span>
            </button>
            <button
              onClick={handleRoadmapClick}
              className="mobile-nav-button bg-gradient-to-r from-purple-400 to-pink-500"
            >
              Roadmap
            </button>
            {path !== "/" && (
              <div onClick={closeDrawer}>
                <WalletButton />
              </div>
            )}
            {path !== '/' && path !== '/app' && (
              <button
                onClick={() => handleNavigation('/app')}
                className="mobile-nav-button bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-orange-500/50"
              >
                Go Back to App
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add the modals */}
      <TelegramNoticeModal
        isOpen={showTelegramNotice}
        onClose={() => setShowTelegramNotice(false)}
        onConfirm={() => {
          setShowTelegramNotice(false);
          window.open("https://t.me/Nexarb_Test_Solana_Bot", "_blank");
        }}
      />

      <RoadmapModal
        isOpen={showRoadmap}
        onClose={() => setShowRoadmap(false)}
      />
    </div>
  );
};

export default Navbar;
