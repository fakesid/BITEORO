import { useState, useEffect, useRef } from "react";
import "@fontsource/montserrat/800.css";
import { FiHome, FiUsers, FiClock, FiGrid, FiPackage, FiSettings, FiLogOut, FiChevronLeft, FiMenu, FiChevronDown, FiUser } from "react-icons/fi";
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
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

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
  const [authView, setAuthView] = useState("landing");
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
    window.addEventListener('navigateToSignUp', handleNavigateToSignUp);
    window.setAuthView = setAuthView;
    return () => {
      window.removeEventListener('navigateToSignUp', handleNavigateToSignUp);
      delete window.setAuthView;
    };
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (!user) {
      setOnboardingChecked(false);
      setShowOnboarding(false);
      return;
    }
    async function checkOnboarding() {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "settings", "onboarding"));
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
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-xs sm:text-sm text-text-muted dark:text-gray-400 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === "signup") return <SignUp />;
    if (authView === "login") return <Login />;
    return <LandingPage onLogin={() => setAuthView("login")} onSignUp={() => setAuthView("signup")} />;
  }

  return (
    <div className="flex h-screen bg-surface-secondary dark:bg-gray-900 text-text-primary dark:text-white overflow-hidden">
      {showOnboarding && onboardingChecked && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

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
          mobileSidebarOpen ? "translate-x-0 w-[260px]" : "-translate-x-full xl:translate-x-0 w-[260px]"
        }`}
      >
        <div className={`h-14 sm:h-16 flex items-center border-b border-border dark:border-gray-700 shrink-0 ${sidebarCollapsed ? "justify-center px-2" : "px-4 sm:px-5"}`}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
              <span className="text-white text-xs sm:text-sm font-bold font-display">B</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-base sm:text-lg font-extrabold tracking-tight font-display animate-fade-in dark:text-white">
                bite<span className="text-brand-500">ORO</span>
              </span>
            )}
          </div>
        </div>

        <nav className={`flex-1 flex flex-col gap-1 py-3 sm:py-4 overflow-y-auto ${sidebarCollapsed ? "px-2" : "px-2 sm:px-3"}`}>
          <span className={`text-[10px] sm:text-2xs font-semibold text-text-muted dark:text-gray-500 uppercase tracking-widest mb-1 sm:mb-2 ${sidebarCollapsed ? "text-center" : "px-2 sm:px-3"}`}>
            {sidebarCollapsed ? "•" : "Menu"}
          </span>
          {filteredTabs.map((tab) => (
            <SidebarButton
              key={tab.name}
              icon={tab.icon}
              name={tab.name}
              active={activeTab === tab.name}
              onClick={() => setActiveTab(tab.name)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className={`border-t border-border dark:border-gray-700 p-2 sm:p-3 shrink-0 ${sidebarCollapsed ? "flex flex-col items-center gap-2" : ""}`}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden xl:flex items-center gap-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-text-muted dark:text-gray-400 hover:bg-surface-tertiary dark:hover:bg-gray-700 transition-all duration-200 text-xs sm:text-sm"
          >
            <FiChevronLeft className={`transition-transform duration-300 text-sm ${sidebarCollapsed ? "rotate-180" : ""}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950 transition-all duration-200 text-xs sm:text-sm font-medium"
          >
            <FiLogOut className="text-sm sm:text-base" />
            {!sidebarCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 sm:h-16 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 border-b border-border dark:border-gray-700 bg-surface dark:bg-gray-800 shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="xl:hidden btn-ghost p-1.5 sm:p-2 rounded-lg"
          >
            <FiMenu className="text-base sm:text-lg" />
          </button>

          <div className="flex-1 max-w-full sm:max-w-md lg:max-w-lg">
            <GlobalSearch onNavigate={(tab) => setActiveTab(tab)} />
          </div>

          <div className="flex-1 hidden sm:block" />

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <NotificationBell onNavigate={(tab) => setActiveTab(tab)} />
            <ThemeToggle />
            
            <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-border dark:border-gray-700 relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-1 sm:gap-2 rounded-xl px-1 sm:px-2 py-1 -mx-1 hover:bg-surface-secondary dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-gradient flex items-center justify-center">
                  <span className="text-white text-[10px] sm:text-xs font-bold">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs sm:text-sm font-medium text-text-primary dark:text-white leading-tight max-w-[80px] truncate">
                    {user?.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-text-muted dark:text-gray-400">Owner</p>
                </div>
                <FiChevronDown className={`hidden sm:block text-text-muted dark:text-gray-400 text-xs sm:text-sm transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 sm:w-56 bg-surface dark:bg-gray-800 border border-border-light dark:border-gray-700 rounded-xl shadow-modal z-50 overflow-hidden animate-fade-in">
                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border-light dark:border-gray-700">
                    <p className="text-xs sm:text-sm font-semibold text-text-primary dark:text-white truncate">{user?.email?.split("@")[0]}</p>
                    <p className="text-[10px] sm:text-2xs text-text-muted dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setActiveTab("Settings"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-text-secondary dark:text-gray-300 hover:bg-surface-secondary dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiSettings className="text-sm sm:text-base text-text-muted dark:text-gray-400" />
                      Settings
                    </button>
                    <button
                      onClick={() => { setActiveTab("Settings"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-text-secondary dark:text-gray-300 hover:bg-surface-secondary dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiUser className="text-sm sm:text-base text-text-muted dark:text-gray-400" />
                      My Account
                    </button>
                  </div>
                  <div className="border-t border-border-light dark:border-gray-700 py-1">
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors"
                    >
                      <FiLogOut className="text-sm sm:text-base" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto dark:bg-gray-900">
          <div className="animate-fade-in p-3 sm:p-4 lg:p-6">
            {currentTab?.component || <div className="p-4 sm:p-8 text-text-muted dark:text-gray-400 text-sm sm:text-base">Coming soon...</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;