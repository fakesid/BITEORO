import { useState, useEffect, useRef } from "react";
import "@fontsource/montserrat/800.css";
import {
  FiHome,
  FiUsers,
  FiClock,
  FiGrid,
  FiPackage,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiMenu,
  FiChevronDown,
  FiUser,
} from "react-icons/fi";
import GlobalSearch from "./components/GlobalSearch";
import NotificationBell from "./components/NotificationBell";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import History from "./pages/History";
import MenuManager from "./pages/MenuManager";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";
import OnboardingModal from "./components/OnboardingModal";
import SidebarButton from "./components/SidebarButton";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle"; // Add this import

const tabs = [
  { name: "Dashboard", component: <Home />, icon: <FiHome /> },
  { name: "Customers", component: <Customers />, icon: <FiUsers /> },
  { name: "History", component: <History />, icon: <FiClock /> },
  { name: "Menu", component: <MenuManager />, icon: <FiGrid /> },
  { name: "Inventory", component: <Inventory />, icon: <FiPackage /> },
  { name: "Settings", component: <Settings />, icon: <FiSettings /> },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [authView, setAuthView] = useState("landing"); // "landing" | "login" | "signup"
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, loading, logout } = useAuth();
  const currentTab = tabs.find((tab) => tab.name === activeTab);

  const filteredTabs = tabs.filter(() => user);

  useEffect(() => {
    function handleNavigateToSignUp() {
      setAuthView("signup");
    }
    window.addEventListener("navigateToSignUp", handleNavigateToSignUp);
    window.setAuthView = setAuthView;
    return () => {
      window.removeEventListener("navigateToSignUp", handleNavigateToSignUp);
      delete window.setAuthView;
    };
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile sidebar on tab change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [activeTab]);

  // Check onboarding status when user logs in
  useEffect(() => {
    if (!user) {
      setOnboardingChecked(false);
      setShowOnboarding(false);
      return;
    }
    async function checkOnboarding() {
      try {
        const snap = await getDoc(
          doc(db, "users", user.uid, "settings", "onboarding"),
        );
        if (!snap.exists() || !snap.data()?.completed) {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.error("Onboarding check failed:", e);
      }
      setOnboardingChecked(true);
    }
    checkOnboarding();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-secondary dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-sm text-text-muted dark:text-gray-400 font-medium">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === "signup") return <SignUp />;
    if (authView === "login") return <Login />;
    return (
      <LandingPage
        onLogin={() => setAuthView("login")}
        onSignUp={() => setAuthView("signup")}
      />
    );
  }

  return (
    <div className="flex h-screen bg-surface-secondary dark:bg-gray-900 text-text-primary dark:text-white overflow-hidden">
      {/* Onboarding modal */}
      {showOnboarding && onboardingChecked && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 xl:hidden animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed xl:static z-50 h-full bg-surface dark:bg-gray-800 border-r border-border dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "xl:w-[70px]" : "xl:w-[240px]"
        } ${
          mobileSidebarOpen
            ? "translate-x-0 w-[260px]"
            : "-translate-x-full xl:translate-x-0 w-[260px]"
        }`}
      >
        {/* Logo */}
        <div
          className={`h-16 flex items-center border-b border-border dark:border-gray-700 shrink-0 ${sidebarCollapsed ? "justify-center px-2" : "px-5"}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold font-display">
                B
              </span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-extrabold tracking-tight font-display animate-fade-in dark:text-white">
                bite<span className="text-brand-500">ORO</span>
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav
          className={`flex-1 flex flex-col gap-1 py-4 overflow-y-auto ${sidebarCollapsed ? "px-2" : "px-3"}`}
        >
          <span
            className={`text-2xs font-semibold text-text-muted dark:text-gray-500 uppercase tracking-widest mb-2 ${sidebarCollapsed ? "text-center" : "px-3"}`}
          >
            {sidebarCollapsed ? "•" : "Menu"}
          </span>
          {filteredTabs.map((tab) => (
            <SidebarButton
              key={tab.name}
              icon={tab.icon}
              name={tab.name}
              active={activeTab === tab.name}
              onClick={() => setActiveTab(tab.name)}
            />
          ))}
        </nav>

        {/* Sidebar footer */}
        <div
          className={`border-t border-border dark:border-gray-700 p-3 shrink-0 ${sidebarCollapsed ? "flex flex-col items-center gap-2" : ""}`}
        >
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden xl:flex items-center gap-2 w-full px-3 py-2 rounded-xl text-text-muted dark:text-gray-400 hover:bg-surface-tertiary dark:hover:bg-gray-700 hover:text-text-primary dark:hover:text-white transition-all duration-200 text-sm"
          >
            <FiChevronLeft
              className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
            />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950 transition-all duration-200 text-sm font-medium"
          >
            <FiLogOut className="text-base" />
            {!sidebarCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-border dark:border-gray-700 bg-surface dark:bg-gray-800 shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="xl:hidden btn-ghost p-2 rounded-lg dark:text-gray-300"
          >
            <FiMenu className="text-lg" />
          </button>

          {/* Search */}
          <GlobalSearch onNavigate={(tab) => setActiveTab(tab)} />

          {/* Spacer to push right actions to the edge */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell onNavigate={(tab) => setActiveTab(tab)} />

            {/* Theme Toggle Button - ADDED HERE */}
            <ThemeToggle />

            <div
              className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-border dark:border-gray-700 relative"
              ref={profileRef}
            >
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 -mx-2 hover:bg-surface-secondary dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-text-primary dark:text-white leading-tight">
                    {user?.email?.split("@")[0]}
                  </p>
                  <p className="text-2xs text-text-muted dark:text-gray-400">
                    Owner
                  </p>
                </div>
                <FiChevronDown
                  className={`hidden lg:block text-text-muted dark:text-gray-400 text-sm transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-surface dark:bg-gray-800 border border-border-light dark:border-gray-700 rounded-xl shadow-modal z-50 overflow-hidden animate-fade-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border-light dark:border-gray-700">
                    <p className="text-sm font-semibold text-text-primary dark:text-white truncate">
                      {user?.email?.split("@")[0]}
                    </p>
                    <p className="text-2xs text-text-muted dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab("Settings");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary dark:text-gray-300 hover:bg-surface-secondary dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiSettings className="text-base text-text-muted dark:text-gray-400" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("Settings");
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary dark:text-gray-300 hover:bg-surface-secondary dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiUser className="text-base text-text-muted dark:text-gray-400" />
                      My Account
                    </button>
                  </div>

                  <div className="border-t border-border-light dark:border-gray-700 py-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors"
                    >
                      <FiLogOut className="text-base" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto dark:bg-gray-900">
          <div className="animate-fade-in">
            {currentTab?.component || (
              <div className="p-8 text-text-muted dark:text-gray-400">
                Coming soon...
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Main App component with ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
