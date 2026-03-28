import React, { useState, useEffect } from "react";
import ThemeToggle from "../components/ThemeToggle";

import {
  FiArrowRight,
  FiShoppingBag,
  FiBarChart2,
  FiUsers,
  FiPackage,
  FiGrid,
  FiClock,
  FiCheck,
  FiStar,
  FiZap,
  FiShield,
  FiSmartphone,
  FiChevronDown,
} from "react-icons/fi";

export default function LandingPage({ onLogin, onSignUp }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <FiShoppingBag />,
      title: "Quick POS",
      desc: "Take orders in seconds with a fast, searchable menu and instant cart.",
      color: "brand",
    },
    {
      icon: <FiGrid />,
      title: "Menu Manager",
      desc: "Add, edit, and toggle stock for menu items. Sortable and searchable.",
      color: "info",
    },
    {
      icon: <FiPackage />,
      title: "Inventory Tracking",
      desc: "Monitor stock levels with low-stock alerts and min-threshold warnings.",
      color: "success",
    },
    {
      icon: <FiBarChart2 />,
      title: "Sales Analytics",
      desc: "Revenue breakdowns by day, week, and month with visual charts.",
      color: "warning",
    },
    {
      icon: <FiUsers />,
      title: "Customer Directory",
      desc: "Auto-built CRM from orders. Track visits, spending, and favorites.",
      color: "danger",
    },
    {
      icon: <FiClock />,
      title: "Order History",
      desc: "Complete order log with payment status, search, and quick actions.",
      color: "info",
    },
  ];

  const colorMap = {
    brand: {
      bg: "bg-brand-50 dark:bg-brand-950",
      text: "text-brand-600 dark:text-brand-400",
      ring: "ring-brand-100 dark:ring-brand-900",
    },
    info: {
      bg: "bg-info-50 dark:bg-info-950",
      text: "text-info-600 dark:text-info-400",
      ring: "ring-info-100 dark:ring-info-900",
    },
    success: {
      bg: "bg-success-50 dark:bg-success-950",
      text: "text-success-600 dark:text-success-400",
      ring: "ring-success-100 dark:ring-success-900",
    },
    warning: {
      bg: "bg-warning-50 dark:bg-warning-950",
      text: "text-warning-600 dark:text-warning-400",
      ring: "ring-warning-100 dark:ring-warning-900",
    },
    danger: {
      bg: "bg-danger-50 dark:bg-danger-950",
      text: "text-danger-600 dark:text-danger-400",
      ring: "ring-danger-100 dark:ring-danger-900",
    },
  };

  const stats = [
    { value: "10x", label: "Faster ordering" },
    { value: "100%", label: "Cloud-based" },
    { value: "0", label: "Setup fees" },
    { value: "24/7", label: "Access anywhere" },
  ];

  const steps = [
    {
      num: "01",
      title: "Create your account",
      desc: "Sign up in 30 seconds. No credit card required.",
    },
    {
      num: "02",
      title: "Add your menu",
      desc: "Import or manually add your restaurant's menu items.",
    },
    {
      num: "03",
      title: "Start taking orders",
      desc: "Use the POS to take orders and track everything instantly.",
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Cafe Owner, Mumbai",
      text: "BiteORO replaced our paper system overnight. The order speed is incredible.",
      rating: 5,
    },
    {
      name: "Rahul Mehra",
      role: "Restaurant Manager, Delhi",
      text: "The analytics alone saved us thousands by identifying our best sellers.",
      rating: 5,
    },
    {
      name: "Ananya Patel",
      role: "Food Truck Owner, Bangalore",
      text: "Simple, fast, and works on my tablet. Exactly what I needed.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary dark:bg-gray-900 overflow-x-hidden overflow-y-auto transition-colors duration-300">
      {/* ===================== NAVBAR ===================== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 overflow-hidden transition-all duration-300 ${
          scrolled
            ? "bg-surface/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border dark:border-gray-700 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold font-display">
                B
              </span>
            </div>
            <span className="text-xl font-extrabold tracking-tight font-display dark:text-white">
              bite<span className="text-brand-500">ORO</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white transition-colors"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white transition-colors"
            >
              How it works
            </a>

            <a
              href="#testimonials"
              className="text-sm text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white transition-colors"
            >
              Testimonials
            </a>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* THEME TOGGLE BUTTON - ADDED HERE */}
            <ThemeToggle />

            <button
              onClick={onLogin}
              className="text-sm font-medium text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white transition-colors px-3 py-2"
            >
              Log in
            </button>
            <button
              onClick={onSignUp}
              className="btn-primary text-sm px-4 py-2"
            >
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* ===================== HERO ===================== */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-20 px-6">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-brand-100/40 dark:bg-brand-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-info-100/30 dark:bg-info-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-100 dark:border-brand-800 mb-6 animate-fade-in-up">
              <FiZap className="text-brand-500 text-xs" />
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                Built for Indian restaurants & cafes
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary dark:text-white leading-[1.1] tracking-tight mb-6 animate-fade-in-up">
              Your restaurant,{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                managed smarter.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up">
              BiteORO is the all-in-one POS and management platform that helps
              you take orders, track inventory, understand your customers, and
              grow your business.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in-up">
              <button
                onClick={onSignUp}
                className="btn-primary btn-lg group w-full sm:w-auto"
              >
                Start free today
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="btn-ghost btn-lg w-full sm:w-auto text-text-secondary dark:text-gray-300"
              >
                See features
                <FiChevronDown className="ml-1" />
              </a>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <div className="rounded-2xl border border-border dark:border-gray-700 bg-surface dark:bg-gray-800 shadow-elevated overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-secondary dark:bg-gray-900 border-b border-border-light dark:border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-danger-300" />
                  <div className="w-3 h-3 rounded-full bg-warning-300" />
                  <div className="w-3 h-3 rounded-full bg-success-300" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="max-w-md mx-auto h-7 rounded-lg bg-surface dark:bg-gray-800 border border-border-light dark:border-gray-700 flex items-center px-3">
                    <span className="text-xs text-text-disabled dark:text-gray-500">
                      app.biteoro.com/dashboard
                    </span>
                  </div>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="p-6 lg:p-8 bg-surface-secondary dark:bg-gray-900">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Orders Today",
                      val: "47",
                      cls: "text-brand-600 dark:text-brand-400",
                    },
                    {
                      label: "Revenue",
                      val: "₹12,450",
                      cls: "text-success-600 dark:text-success-400",
                    },
                    {
                      label: "Customers",
                      val: "32",
                      cls: "text-info-600 dark:text-info-400",
                    },
                    {
                      label: "Avg Order",
                      val: "₹265",
                      cls: "text-warning-600 dark:text-warning-400",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-surface dark:bg-gray-800 rounded-xl border border-border-light dark:border-gray-700 p-4"
                    >
                      <p className="text-[10px] sm:text-xs text-text-muted dark:text-gray-400 mb-1">
                        {s.label}
                      </p>
                      <p className={`text-lg sm:text-2xl font-bold ${s.cls}`}>
                        {s.val}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-surface dark:bg-gray-800 rounded-xl border border-border-light dark:border-gray-700 p-4 h-40">
                    {/* Fake chart bars */}
                    <p className="text-xs font-medium text-text-secondary dark:text-gray-300 mb-3">
                      Sales this week
                    </p>
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 50, 80, 60, 90, 45].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-brand-100 dark:bg-brand-900 rounded-t-md relative"
                          style={{ height: `${h}%` }}
                        >
                          <div
                            className="absolute inset-x-0 bottom-0 bg-brand-400 dark:bg-brand-600 rounded-t-md"
                            style={{ height: `${h * 0.7}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-surface dark:bg-gray-800 rounded-xl border border-border-light dark:border-gray-700 p-4 h-40">
                    <p className="text-xs font-medium text-text-secondary dark:text-gray-300 mb-3">
                      Top items
                    </p>
                    <div className="space-y-2.5">
                      {["Masala Chai", "Paneer Wrap", "Cold Coffee"].map(
                        (item, i) => (
                          <div key={item} className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400" : "bg-surface-tertiary dark:bg-gray-700 text-text-muted dark:text-gray-400"}`}
                            >
                              {i + 1}
                            </span>
                            <span className="text-xs text-text-primary dark:text-white">
                              {item}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS BAR ===================== */}
      <section className="py-12 border-y border-border dark:border-gray-700 bg-surface dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl lg:text-4xl font-extrabold bg-brand-gradient bg-clip-text text-transparent mb-1">
                {s.value}
              </p>
              <p className="text-sm text-text-muted dark:text-gray-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section id="features" className="py-20 lg:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3 block">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary dark:text-white mb-4">
              Everything you need to run your restaurant
            </h2>
            <p className="text-text-secondary dark:text-gray-300 max-w-xl mx-auto">
              From taking orders to understanding your business — all in one
              clean, fast dashboard.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const c = colorMap[f.color];
              return (
                <div
                  key={f.title}
                  className="group card p-6 bg-white dark:bg-gray-800 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className={`${c.text} text-xl`}>{f.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section
        id="how-it-works"
        className="py-20 lg:py-28 px-6 bg-surface dark:bg-gray-800"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3 block">
              How it works
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary dark:text-white mb-4">
              Up and running in minutes
            </h2>
            <p className="text-text-secondary dark:text-gray-300 max-w-lg mx-auto">
              No hardware. No installation. Just sign up and start managing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border-light dark:bg-gray-700" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient text-white text-xl font-bold font-display mb-5 shadow-lg shadow-brand-500/20">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== BENEFITS ===================== */}
      <section className="py-20 lg:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3 block">
                Why BiteORO
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary dark:text-white mb-6">
                Built for the way restaurants actually work
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: <FiZap />,
                    title: "Lightning fast",
                    desc: "Take an order in under 10 seconds. No loading, no lag.",
                  },
                  {
                    icon: <FiShield />,
                    title: "Your data, secured",
                    desc: "Each business gets its own isolated workspace. Cloud-backed by Firebase.",
                  },
                  {
                    icon: <FiSmartphone />,
                    title: "Works everywhere",
                    desc: "Tablet, phone, or desktop. One responsive web app for all devices.",
                  },
                  {
                    icon: <FiBarChart2 />,
                    title: "Insights that matter",
                    desc: "Know your best sellers, busiest days, and top customers at a glance.",
                  },
                ].map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-brand-500 dark:text-brand-400">
                        {b.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary dark:text-white mb-0.5">
                        {b.title}
                      </h4>
                      <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-gradient rounded-3xl opacity-5 blur-2xl" />
              <div className="relative card p-8 space-y-5 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3 pb-5 border-b border-border-light dark:border-gray-700">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center">
                    <FiShoppingBag className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary dark:text-white">
                      New Order #1047
                    </p>
                    <p className="text-xs text-text-muted dark:text-gray-400">
                      Just now
                    </p>
                  </div>
                  <span className="badge-success ml-auto">Paid</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Butter Chicken", qty: 2, price: 350 },
                    { name: "Garlic Naan", qty: 4, price: 60 },
                    { name: "Mango Lassi", qty: 2, price: 120 },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-text-muted dark:text-gray-400">
                          Qty: {item.qty}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-text-primary dark:text-white">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-gray-700">
                  <span className="text-sm text-text-muted dark:text-gray-400">
                    Total
                  </span>
                  <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                    ₹1,180
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section
        id="testimonials"
        className="py-20 lg:py-28 px-6 bg-surface dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3 block">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary dark:text-white mb-4">
              Loved by restaurant owners
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6 bg-white dark:bg-gray-800">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="text-warning-500 fill-warning-400 w-4 h-4"
                    />
                  ))}
                </div>
                <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed mb-5">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border-light dark:border-gray-700">
                  <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {t.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary dark:text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-text-muted dark:text-gray-400">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="py-20 lg:py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute -inset-8 bg-brand-gradient rounded-3xl opacity-5 blur-3xl" />
            <div className="relative card p-12 lg:p-16 bg-white dark:bg-gray-800">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary dark:text-white mb-4">
                Ready to modernize your restaurant?
              </h2>
              <p className="text-text-secondary dark:text-gray-300 max-w-lg mx-auto mb-8">
                Join hundreds of restaurant owners who switched to BiteORO. Free
                to start, no credit card needed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onSignUp}
                  className="btn-primary btn-lg group w-full sm:w-auto"
                >
                  Get started for free
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onLogin}
                  className="btn-ghost btn-lg w-full sm:w-auto dark:text-gray-300"
                >
                  I already have an account
                </button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-xs text-text-muted dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <FiCheck className="text-success-500" /> Free forever plan
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCheck className="text-success-500" /> No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCheck className="text-success-500" /> Setup in 2 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-border dark:border-gray-700 bg-surface dark:bg-gray-800 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
              <span className="text-white text-xs font-bold font-display">
                B
              </span>
            </div>
            <span className="text-sm font-bold font-display dark:text-white">
              bite<span className="text-brand-500">ORO</span>
            </span>
          </div>
          <p className="text-xs text-text-muted dark:text-gray-400">
            © {new Date().getFullYear()} BiteORO. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-xs text-text-muted dark:text-gray-400 hover:text-text-primary dark:hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-xs text-text-muted dark:text-gray-400 hover:text-text-primary dark:hover:text-white transition-colors"
            >
              How it works
            </a>

            <button
              onClick={onLogin}
              className="text-xs text-text-muted dark:text-gray-400 hover:text-text-primary dark:hover:text-white transition-colors"
            >
              Log in
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
