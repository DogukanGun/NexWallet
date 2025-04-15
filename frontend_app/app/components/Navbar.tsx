"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buttonClass } from "./ButtonClass";
import { useAppKitAccount } from "@reown/appkit/react";
import WalletButton from "./WalletButton";
import TelegramNoticeModal from './TelegramNoticeModal';
import RoadmapModal from './RoadmapModal';
import { useState } from "react";
import { useTheme } from "@/store/ThemeContext";

const Navbar = () => {
  const path = usePathname();
  const router = useRouter();
  const [showTelegramNotice, setShowTelegramNotice] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
        <div className="navbar h-20 backdrop-blur-md bg-base-200/30 text-base-content shadow-lg w-full fixed top-0 z-50">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost hover:bg-primary/20"
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
              <li>
                <button
                  onClick={toggleTheme}
                  className="nav-button bg-gradient-to-r from-base-300 to-base-200 border border-base-300 hover:border-primary/50"
                >
                  {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                  )}
                </button>
              </li>
              {path === "/" && (
                <li>
                  <Link
                    href="/app"
                    className="nav-button bg-gradient-to-r from-orange-400 to-pink-500 text-white"
                  >
                    Launch NexWallet
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={() => setShowRoadmap(true)}
                  className="nav-button bg-gradient-to-r from-purple-400 to-pink-500 text-white"
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
                    className={`nav-button ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-base-300 to-base-200 border border-base-300 hover:border-primary/50 text-white'
                        : 'bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 hover:border-blue-300 text-blue-600'
                    }`}
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
      
      {/* Sidebar */}
      <div className="drawer-side lg:hidden z-[100]">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="menu min-h-full w-80 bg-base-200 p-4">
          <div className="flex justify-end mb-4">
            <label
              htmlFor="my-drawer-3"
              className="btn btn-square btn-ghost hover:bg-primary/20"
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
            <button
              onClick={toggleTheme}
              className="mobile-nav-button bg-gradient-to-r from-base-300 to-base-200 border border-base-300 hover:border-primary/50 flex items-center gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                  Switch to Dark Mode
                </>
              )}
            </button>
            {path === "/" && (
              <Link
                href="/app"
                className="mobile-nav-button bg-gradient-to-r from-orange-400 to-pink-500 text-white"
              >
                Launch NexWallet
              </Link>
            )}
            <button
              onClick={() => setShowRoadmap(true)}
              className="mobile-nav-button bg-gradient-to-r from-purple-400 to-pink-500 text-white"
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
                className={`mobile-nav-button ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-base-300 to-base-200 border border-base-300 hover:border-primary/50 text-white'
                    : 'bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 hover:border-blue-300 text-blue-600'
                }`}
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
