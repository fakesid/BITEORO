# BITEORO — Project Overview & Development Guide

> **Last updated:** 7 March 2026
> **Version:** 0.1.0 (early development)
> **Purpose:** SaaS restaurant/cafe POS & management platform

---

## Table of Contents

1. [What Is BiteORO?](#1-what-is-biteoro)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Firebase Data Model](#5-firebase-data-model)
6. [Authentication & Roles](#6-authentication--roles)
7. [Feature Inventory](#7-feature-inventory)
8. [Page-by-Page Breakdown](#8-page-by-page-breakdown)
9. [Component Reference](#9-component-reference)
10. [Styling & Design System](#10-styling--design-system)
11. [Known Bugs & Inconsistencies](#11-known-bugs--inconsistencies)
12. [Dead / Unused Code](#12-dead--unused-code)
13. [Recommendations](#13-recommendations)
14. [Development Roadmap](#14-development-roadmap)

---

## 1. What Is BiteORO?

BiteORO is a **multi-tenant cafe/restaurant management web app** designed as a SaaS product. Each business owner signs up, gets their own workspace, and can:

- Take & manage orders (POS)
- Manage a menu (add/edit/delete items, stock toggle)
- Track inventory (quantity, min thresholds, low-stock alerts)
- View a customer directory (auto-built from orders)
- See sales analytics & history (revenue breakdowns, charts)
- (Planned) Manage staff accounts with role-based access

The app uses a **tab-based single-page layout** with a sidebar and renders different pages as React components based on the selected tab.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React (Create React App) | 19.1.0 |
| **Backend / DB** | Firebase (Firestore + Auth + Hosting) | 11.9.1 |
| **Styling** | Tailwind CSS + inline styles (mixed) | 3.4.1 |
| **UI Libraries** | MUI Material (installed, barely used), Heroicons, react-icons | 7.1.2 / 2.2.0 / 5.5.0 |
| **Charts** | Recharts | 3.0.2 |
| **Fonts** | Montserrat (via @fontsource), Inter/Roboto/Nunito (Tailwind config) | — |
| **Routing** | react-router-dom (**installed but NOT used**) | 7.6.2 |
| **Crypto** | bcryptjs (for staff password hashing, client-side) | 3.0.2 |
| **Hosting** | Firebase Hosting | — |

### Dev Dependencies
- Tailwind CSS 3.4.1, PostCSS 8.4.31, Autoprefixer 10.4.14

---

## 3. Project Structure

```
BITEORO/
├── firebase.json              # Firebase Hosting config (serves /build)
├── package.json               # Dependencies & scripts
├── tailwind.config.js         # Tailwind with custom colors, fonts, shadows
├── postcss.config.js          # PostCSS (Tailwind + autoprefixer)
├── build/                     # Production build output
├── public/                    # Static assets (index.html, manifest.json)
├── backups/                   # Manual backups
└── src/
    ├── index.js               # React entry point (wraps App in AuthProvider + AccentProvider)
    ├── index.css              # Tailwind directives (@tailwind base/components/utilities)
    ├── accent.css             # CSS custom property: --accent-gradient
    ├── App.css                # CRA boilerplate (unused)
    ├── App.js                 # Main app shell: sidebar, tab routing, auth gating
    ├── firebase.js            # Firebase initialization (app, db, auth, analytics)
    ├── Dashboard.js           # ⚠️ LEGACY dashboard (reads top-level 'orders' collection)
    ├── OrderBill.js           # Printable receipt component
    ├── context/
    │   ├── AuthContext.js     # Firebase Auth state + user role from Firestore
    │   └── AccentContext.js   # Global accent gradient (CSS variable)
    ├── hooks/
    │   └── useAccentColor.js  # Persists accent color to Firestore (ui/accentColor)
    ├── components/
    │   ├── SidebarButton.jsx  # Sidebar nav button with active indicator
    │   ├── DashboardSummary.jsx  # Today's sales summary (realtime)
    │   ├── RecentOrders.jsx   # Today's orders list with expand/toggle-paid/delete
    │   ├── TopSellingItems.jsx # Top selling items ranked list
    │   ├── LowStockInventory.jsx # Low stock items list (realtime)
    │   ├── AccentSwitcher.jsx # Gradient picker (from AccentContext)
    │   ├── AdminSetupForm.jsx # Admin username + PIN setup form
    │   ├── StaffManager.jsx   # Add staff with bcrypt passwords (stores in user doc)
    │   ├── StaffLoginForm.jsx # Staff login via bcrypt compare (reads user doc)
    │   └── TopSellingItems.jsx
    └── pages/
        ├── Home.jsx           # Dashboard: summary + orders + low stock + new order modal
        ├── Customers.jsx      # Customer CRM (derived from orders data)
        ├── History.jsx        # Sales analytics page with Recharts bar charts
        ├── MenuManager.jsx    # Full CRUD for menu items
        ├── Inventory.jsx      # Full CRUD for inventory items
        ├── ImprovedOrderPage.jsx  # Order-taking POS UI (menu search + cart + checkout)
        ├── DesignSystem.jsx   # Instagram-inspired UI kit preview + color picker
        ├── Login.jsx          # Email/password login + forgot password
        ├── SignUp.jsx         # Business owner registration
        ├── SignUpStaff.jsx    # Staff account registration (Firebase Auth)
        ├── StaffAccounts.jsx  # Admin panel placeholder (profile, staff, roles, dark mode)
        └── Order.jsx          # ⚠️ Placeholder stub (unused)
```

---

## 4. Architecture & Data Flow

### App Shell (App.js)
```
index.js
  └── AuthProvider (Firebase Auth state)
       └── AccentProvider (global accent gradient)
            └── App
                 ├── if loading → "Loading..."
                 ├── if !user → Login / SignUp forms
                 └── if user → Sidebar + Tab Content
                      ├── Dashboard (Home.jsx)
                      ├── Customers
                      ├── History
                      ├── Menu
                      ├── Inventory
                      └── Design System
```

### Navigation
- **No URL routing.** Tabs are managed via `useState("Dashboard")` in App.js.
- Sidebar renders filtered tabs (Login tab shown only when logged out; other tabs only when logged in).
- `react-router-dom` is installed but **completely unused**.

### Auth Flow
1. User lands on app → `AuthProvider` listens to `onAuthStateChanged`
2. If not authenticated → shows Login or SignUp form
3. Login calls `signInWithEmailAndPassword` → Firebase sets auth state
4. `AuthProvider` picks up the new user, fetches `users/{uid}` doc for role
5. App renders the authenticated layout with sidebar

### Data Flow Pattern
- All data is scoped to `users/{uid}/` subcollections (multi-tenant)
- Components independently subscribe to their data (no global state for orders/menu/inventory)
- Multiple components may subscribe to the same collection simultaneously (e.g., `DashboardSummary`, `RecentOrders`, and `TopSellingItems` all read `users/{uid}/orders`)

---

## 5. Firebase Data Model

### Collections & Documents

```
Firestore Root
│
├── users/                          # Top-level collection
│   ├── {auto-id}                   # ⚠️ BUG: SignUp.jsx creates docs with auto-generated IDs
│   │   ├── uid: string
│   │   ├── email: string
│   │   ├── name: string
│   │   ├── businessName: string
│   │   └── createdAt: timestamp
│   │
│   ├── {uid}                       # SignUpStaff.jsx uses the Auth UID as doc ID
│   │   ├── email: string
│   │   ├── role: "staff"
│   │   └── staffProfiles: [        # StaffManager.jsx stores staff array here
│   │       { name, email, passwordHash, permissions[] }
│   │   ]
│   │
│   └── {uid}/                      # User-scoped subcollections
│       ├── orders/                 # Order documents
│       │   └── {orderId}
│       │       ├── customerName: string
│       │       ├── customerPhone: string
│       │       ├── items: [{ name, price, quantity, id }]
│       │       ├── total: number
│       │       ├── paid: boolean
│       │       ├── paymentMode: "cash" | "card" | "upi"
│       │       ├── status: "new"
│       │       └── createdAt: serverTimestamp
│       │
│       ├── menu/                   # Menu item documents
│       │   └── {menuItemId}
│       │       ├── name: string
│       │       ├── price: number
│       │       └── inStock: boolean
│       │
│       └── inventory/              # Inventory item documents
│           └── {inventoryItemId}
│               ├── name: string
│               ├── quantity: number
│               ├── unit: "pcs" | "kg" | "L"
│               └── min: number
│
├── orders/                         # ⚠️ LEGACY: used only by Dashboard.js (old code)
│
└── ui/
    └── accentColor                 # Global accent color (shared across all users!)
        └── color: string           # e.g., "#ef4444"
```

### Critical Data Model Issues

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | **SignUp doc ID mismatch** | 🔴 High | `SignUp.jsx` uses `addDoc(collection(db, "users"), {...})` — creates a doc with **auto-generated ID**, not the user's UID. `AuthContext.js` reads `doc(db, "users", firebaseUser.uid)` — looks for a doc **keyed by UID**. The role will always be `null` for business owners. |
| 2 | **Accent color is global** | 🟡 Medium | `ui/accentColor` is a single shared document. All users share the same accent color. Should be per-user: `users/{uid}/settings/accentColor`. |
| 3 | **No Firestore security rules** | 🔴 High | No `firestore.rules` file in the project. Data is likely accessible to anyone. |
| 4 | **Legacy orders collection** | 🟡 Low | Top-level `orders` collection is only used by `Dashboard.js` (which is dead code). Can be cleaned up. |

---

## 6. Authentication & Roles

### Current State

| Flow | Location | Mechanism |
|------|----------|-----------|
| **Business owner sign-up** | `SignUp.jsx` | `createUserWithEmailAndPassword` → `addDoc` to `users` (⚠️ wrong ID) |
| **Login** | `Login.jsx` | `signInWithEmailAndPassword` |
| **Forgot password** | `Login.jsx` | `sendPasswordResetEmail` |
| **Staff sign-up** | `SignUpStaff.jsx` | `createUserWithEmailAndPassword` → `setDoc(doc(db, "users", uid))` with `role: "staff"` |
| **Staff login (alt)** | `StaffLoginForm.jsx` | Reads owner's `staffProfiles`, bcrypt compares password |
| **Role detection** | `AuthContext.js` | Reads `users/{uid}.role` on auth state change |

### Two Conflicting Staff Systems

**System A — Firebase Auth per staff** (`SignUpStaff.jsx`)
- Each staff member gets their own Firebase Auth account
- Writes `role: "staff"` to `users/{uid}` doc
- Staff are independent auth users
- **Problem:** No link between staff and the business they belong to

**System B — bcrypt profiles in owner doc** (`StaffManager.jsx` + `StaffLoginForm.jsx`)
- Owner adds staff profiles (name, email, password hash) stored as an array in their user doc
- Staff log in via `StaffLoginForm` which bcrypt-compares against stored hashes
- **Problem:** Client-side bcrypt is weak security; doesn't leverage Firebase Auth

### Recommendation

**Go with Firebase Auth per staff (System A), enhanced:**
- Add `businessId` (owner's UID) to staff user doc so staff are linked to their business
- Staff data structure: `users/{staffUid}` → `{ email, role: "staff", businessId: "{ownerUid}", permissions: [...] }`
- Staff reads data from `users/{businessId}/orders`, etc. (same subcollections, but owner's scope)
- Remove bcrypt-based system entirely (System B)

---

## 7. Feature Inventory

| Feature | Status | Page / Component | Notes |
|---------|--------|-----------------|-------|
| Business sign-up | ⚠️ Buggy | `SignUp.jsx` | Doc ID mismatch (see bug #1) |
| Login / Logout | ✅ Working | `Login.jsx`, `App.js` | Email/password + forgot password |
| Dashboard (today's summary) | ✅ Working | `Home.jsx` → `DashboardSummary` | Realtime today's orders/revenue/paid/unpaid |
| New Order (POS) | ✅ Working | `Home.jsx` → `ImprovedOrderPage` | Menu search, cart, customer info, payment, place order |
| Recent Orders | ✅ Working | `RecentOrders.jsx` | Today's orders, expand details, toggle paid, delete |
| Menu CRUD | ✅ Working | `MenuManager.jsx` | Add/edit/delete, stock toggle, sort, search |
| Inventory CRUD | ✅ Working | `Inventory.jsx` | Add/delete, +/- qty, low stock alerts, sort, search |
| Low Stock Widget | ✅ Working | `LowStockInventory.jsx` | Realtime, filtered to qty <= min |
| Top Selling Items | ✅ Working | `TopSellingItems.jsx` | All-time aggregation from orders |
| Customer CRM | ✅ Working | `Customers.jsx` | Auto-built from orders, search/sort, expand history |
| Sales Analytics | ✅ Working | `History.jsx` | Revenue breakdowns, Recharts charts (weekday, month, top items) |
| Order Bill / Receipt | ✅ Code exists | `OrderBill.js` | Print-ready receipt, but **not wired into any UI** |
| Design System preview | ✅ Working | `DesignSystem.jsx` | Instagram-inspired component gallery with color picker |
| Accent color persistence | ⚠️ Partial | `useAccentColor.js` | Works but is global (not per-user) |
| Staff management | 🚧 Incomplete | `StaffManager.jsx`, `StaffLoginForm.jsx`, `SignUpStaff.jsx` | Two conflicting systems, neither fully integrated |
| Admin panel | 🚧 Placeholder | `StaffAccounts.jsx` | Skeleton only — profile settings, staff list, roles, dark mode (all stubs) |
| Order status tracking | ❌ Not started | — | Order `status` field is set to `"new"` but never updated |
| Sales trend chart | ❌ Placeholder | `History.jsx` | "[Chart Placeholder]" — not implemented |
| Recent orders table | ❌ Placeholder | `History.jsx` | "[Order Table Placeholder]" — not implemented |
| Search bar (top bar) | ❌ Non-functional | `App.js` | Input exists but doesn't filter or search anything |
| Dark mode | ❌ Not started | `tailwind.config.js` has `darkMode: 'class'` | Toggle exists in placeholder admin panel but not functional |

---

## 8. Page-by-Page Breakdown

### Dashboard (`Home.jsx`)
- **Layout:** 2-column grid — left: summary + top sellers + low stock; right: recent orders
- **Key feature:** "New Order" button opens `ImprovedOrderPage` in a modal overlay
- **Data:** Delegates to child components (no direct Firebase calls)

### Customers (`Customers.jsx`)
- **Data source:** Subscribes to `users/{uid}/orders` (realtime)
- **Logic:** Groups orders by `customerPhone`, computes per-customer stats (total spend, order count, most-ordered item, last seen)
- **UI:** Search by name/phone, sort by last seen/total/orders/name, expandable order history
- **Highlights:** "Frequent" badge (10+ orders), "Unknown" warning for missing phone numbers

### History (`History.jsx`)
- **Data source:** Fetches `users/{uid}/orders` (one-time, not realtime)
- **Analytics:** Today / This Week / This Month / All Time — revenue & order counts
- **Charts:** Bar charts via Recharts — sales by weekday, by day of month, top items by quantity
- **Placeholders:** "Sales Trend (Coming Soon)", "Recent Orders (Coming Soon)"

### Menu Manager (`MenuManager.jsx`)
- **Data source:** `users/{uid}/menu` (read on mount, refetch after mutations)
- **CRUD:** Add item (name + price + stock toggle), inline edit, delete with confirm
- **UI:** Summary bar (total/in-stock/out-of-stock), sortable table, search, toast notifications

### Inventory (`Inventory.jsx`)
- **Data source:** `users/{uid}/inventory` (realtime via onSnapshot)
- **CRUD:** Add item (name + qty + unit + min threshold), +/- buttons, delete
- **UI:** Summary bar (total/low stock/out of stock), sortable table, search, status badges

### Order Page (`ImprovedOrderPage.jsx`)
- **Layout:** 2-panel — left: searchable menu; right: cart + checkout
- **Flow:** Search menu → click +/- to add to cart → enter customer name/phone → select payment → place order
- **Validation:** 10-digit phone validation, empty cart check
- **Data:** Reads `menu`, writes to `orders` with `serverTimestamp()`

### Design System (`DesignSystem.jsx`)
- **Purpose:** Live component gallery for the "Instagram-inspired" redesign
- **Features:** Color picker that persists accent color to Firestore, previews of all major components
- **Note:** The redesigned components here are **local to this page** — they are NOT yet applied to the actual app

### Login / SignUp
- Login: email/password + forgot password, inline styles
- SignUp: name, business name, email, password, confirm password, inline styles
- Navigation between them via `window.CustomEvent` (fragile)

---

## 9. Component Reference

| Component | Props | Firebase | Description |
|-----------|-------|----------|-------------|
| `SidebarButton` | icon, name, active, onClick, accentColor | — | Nav button with colored active indicator |
| `DashboardSummary` | — | READ `orders` | Today's orders/paid/unpaid/revenue (realtime) |

*Customers page now lets you toggle an order's paid/unpaid status directly from the expanded card view via an edit icon.*
| `RecentOrders` | — | READ/WRITE `orders` | Today's order list, expand, toggle paid, delete |
| `TopSellingItems` | max | READ `orders` | Ranked top-selling items (all time) |
| `LowStockInventory` | max | READ `inventory` | Items where qty ≤ min (realtime) |
| `AccentSwitcher` | — | — | Gradient picker (uses AccentContext) |
| `AdminSetupForm` | userId, onComplete, createAdminProfile | — (via callback) | Admin username + PIN setup |
| `StaffManager` | userId | READ/WRITE `users/{id}` | Add staff (bcrypt), list staff |
| `StaffLoginForm` | userId, onLogin | READ `users/{id}` | Staff login via bcrypt compare |
| `OrderBill` | order | — | Printable receipt |

---

## 10. Styling & Design System

### Current State: Mixed & Inconsistent

The app uses **three different styling approaches** simultaneously:

1. **Tailwind CSS** — most pages (Dashboard, Menu, Inventory, Customers, History)
2. **Inline styles** — Login.jsx, SignUp.jsx, Dashboard.js (legacy)
3. **CSS custom properties** — accent.css for gradient variable

### Tailwind Config Colors
```js
colors: {
  primary: "#FF6F61",
  secondary: "#0095F6",
  accent: "#FF8A65",
  charcoal: "#262626",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  border: "#E0E0E0",
  success: "#27AE60",
  error: "#EB5757",
}
```

### Missing Tailwind Colors (used in code but NOT defined)
These color names appear in component classNames but are **not in** `tailwind.config.js`:
- `text-sienna`, `bg-sienna/10`, `border-sienna`, `bg-sienna/5` → used extensively in Menu, Inventory, Customers, RecentOrders
- `text-caribbean-current`, `bg-caribbean-current`, `bg-caribbean-current/10` → used in Menu, Inventory, RecentOrders
- `bg-rich-black`, `text-papaya-whip` → used in Menu, Inventory add-item forms

**These classes produce no styling** since the colors aren't defined. The elements render with default/no colors, which is why the add-item input fields in Menu and Inventory likely appear unstyled.

### Design System Vision
`DesignSystem.jsx` contains a full **Instagram-inspired redesign** with:
- Clean white backgrounds, subtle borders, rounded-2xl cards
- Accent color applied via style prop (not CSS variables)
- Shadow cards (`shadow-card` defined in Tailwind config)
- Font: Inter/sans-serif (configured in Tailwind)

**This redesign has NOT been applied to the actual app pages yet.**

---

## 11. Known Bugs & Inconsistencies

| # | Bug | Severity | File(s) | Fix |
|---|-----|----------|---------|-----|
| 1 | **SignUp creates doc with auto-ID, AuthContext reads by UID** | 🔴 Critical | `SignUp.jsx`, `AuthContext.js` | Change `addDoc` to `setDoc(doc(db, "users", userCredential.user.uid), {...})` |
| 2 | **Missing Tailwind colors (sienna, caribbean-current, etc.)** | 🟠 High | Menu, Inventory, Customers, RecentOrders | Add to `tailwind.config.js` or replace with defined colors |
| 3 | **Accent color is global (shared by ALL users)** | 🟡 Medium | `useAccentColor.js` | Move to `users/{uid}/settings/accentColor` |
| 4 | **Login/SignUp navigation via window.CustomEvent** | 🟡 Medium | `Login.jsx`, `SignUp.jsx`, `App.js` | Use React state lifting or React Router |
| 5 | **SignUp.jsx does not store `role` field** | 🟡 Medium | `SignUp.jsx` | Add `role: "admin"` or `role: "owner"` to the saved doc |
| 6 | **No error boundaries** | 🟡 Medium | App-wide | Firebase/network errors could crash the app |
| 7 | **Multiple simultaneous Firestore listeners to same collection** | 🟡 Low | `DashboardSummary`, `RecentOrders`, `TopSellingItems` | Consider a shared data context for orders |
| 8 | **bcryptjs used client-side for staff passwords** | 🟠 High | `StaffManager.jsx`, `StaffLoginForm.jsx` | Security issue — remove in favor of Firebase Auth |
| 9 | **No `price` validation** in MenuManager | 🟢 Low | `MenuManager.jsx` | Price can be negative or non-numeric string |
| 10 | **`TopSellingItems` fetches ALL orders every render** | 🟡 Medium | `TopSellingItems.jsx` | Should cache or use aggregation |

---

## 12. Dead / Unused Code

| File / Import | Status | Can Remove? |
|---------------|--------|-------------|
| `src/Dashboard.js` | Legacy dashboard — reads top-level `orders` (old data model) | ✅ Yes |
| `src/pages/Order.jsx` | Placeholder stub — 10 lines, just static text | ✅ Yes |
| `src/App.css` | CRA boilerplate — not imported or used by current layout | ✅ Yes |
| `react-router-dom` (package) | Installed but never imported anywhere | ✅ Remove or use |
| `@mui/material` + `@mui/icons-material` | Installed (7.1.2) but not imported in any component | ✅ Remove or use |
| `@heroicons/react` | Installed but not imported anywhere | ✅ Remove or use |
| `@emotion/react` + `@emotion/styled` | MUI peer deps — remove if MUI is removed | ✅ (with MUI) |
| `src/pages/SignUpStaff.jsx` | Not imported/rendered in App.js or anywhere | ⚠️ Keep if staff system is planned |
| `src/pages/StaffAccounts.jsx` | Not imported/rendered in App.js | ⚠️ Keep if admin panel is planned |
| `src/components/AdminSetupForm.jsx` | Imported in App.js but **commented out** | ⚠️ Keep if admin setup is planned |
| `src/components/StaffManager.jsx` | Not imported anywhere except standalone | ⚠️ Keep if staff system is planned |
| `src/components/StaffLoginForm.jsx` | Not imported anywhere except standalone | ⚠️ Decide on staff system first |
| `src/OrderBill.js` | Never rendered — receipt component exists but not wired in | ⚠️ Keep — wire into RecentOrders |

---

## 13. Recommendations

### 🔴 Priority 1: Fix Critical Bugs

1. **Fix SignUp data model** — use `setDoc(doc(db, "users", uid), {...})` instead of `addDoc`; add `role: "owner"`.
2. **Add missing Tailwind colors** — define `sienna`, `caribbean-current`, `rich-black`, `papaya-whip` in config, OR migrate all pages to the design system palette.
3. **Add Firestore security rules** — at minimum, users can only read/write their own subcollections.
4. **Move Firebase config to environment variables** (`.env` file).

### 🟠 Priority 2: Architecture Improvements

5. **Adopt React Router** — replace tab state with URL-based routing (`/dashboard`, `/menu`, `/orders`, etc.). This enables:
   - Deep linking and bookmarks
   - Browser back/forward navigation
   - Protected routes (redirect to login)
   - Code splitting per route
6. **Consolidate staff system** — go with Firebase Auth per staff:
   - Staff doc: `users/{staffUid}` → `{ role: "staff", businessId: ownerUid, permissions: [] }`
   - Staff reads data from `users/{businessId}/*` subcollections
   - Remove bcrypt-based StaffManager/StaffLoginForm
7. **Create a shared data context** for orders — avoid 3+ simultaneous `onSnapshot` subscriptions to the same collection. One `OrdersProvider` that all components consume.
8. **Unify styling** — apply the Instagram-inspired design system from `DesignSystem.jsx` across all pages. Remove inline styles from Login/SignUp and use the new Instagram gradient as the default accent.  

*The theme now uses a four-stop Instagram gradient by default and includes an `instagram` color palette and `bg-instagram-gradient` utility for new components.*

### 🟡 Priority 3: Complete Unfinished Features

9. **Wire up OrderBill** — add a "Print Receipt" button in `RecentOrders` expanded view.
10. **Implement the admin panel** (`StaffAccounts.jsx`) — profile settings, staff list, role management.
11. **Build the sales trend chart** — replace placeholder in History.jsx with a line chart.
12. **Make the search bar functional** — global search across orders, customers, and menu items.
13. **Add order status workflow** — new → preparing → ready → completed/cancelled.
14. **Implement dark mode** — Tailwind `darkMode: 'class'` is configured; add a toggle and `dark:` classes.

### 🟢 Priority 4: Enhancements

15. **Menu categories** — group items (e.g., "Beverages", "Main Course", "Desserts").
16. **Export reports** — CSV/PDF export for sales, orders, inventory.
17. **Notifications** — low stock alerts, new order alerts (browser notifications or in-app).
18. **Tables / Dine-in support** — table assignment for orders.
19. **Responsive design** — test and fix mobile layout (sidebar collapse works, but pages need attention).

---

## 14. Development Roadmap

### Phase 1: Stabilize (Week 1-2)
- [ ] Fix SignUp.jsx data model (`setDoc` with UID, add role)
- [ ] Add missing Tailwind colors to config
- [ ] Add Firestore security rules
- [ ] Move Firebase config to `.env`
- [ ] Remove dead code (Dashboard.js, Order.jsx, App.css, unused packages)
- [ ] Unify Login/SignUp styling (Tailwind instead of inline)

### Phase 2: Architecture (Week 3-4)
- [ ] Implement React Router (routes for all pages + protected routes)
- [ ] Create `OrdersProvider` context (shared orders subscription)
- [ ] Consolidate staff system (Firebase Auth per staff with businessId)
- [ ] Apply design system to all pages (use DesignSystem.jsx components as base)

### Phase 3: Complete Features (Week 5-7)
- [ ] Wire up OrderBill (print from RecentOrders)
- [ ] Build admin panel (profile settings, staff CRUD, role permissions)
- [ ] Implement sales trend line chart
- [ ] Make search bar functional
- [ ] Add order status workflow (new → preparing → ready → done)
- [ ] Add menu categories

### Phase 4: Polish & Launch (Week 8+)
- [ ] Dark mode
- [ ] Mobile responsiveness pass
- [ ] Export reports (CSV/PDF)
- [ ] Browser notifications for low stock
- [ ] Performance optimization (pagination, memoization)
- [ ] User onboarding flow
- [ ] Deploy to production Firebase Hosting

---

## Appendix: Firebase Config

```
Project ID: biteoro-fa6db
Auth Domain: biteoro-fa6db.firebaseapp.com
Hosting: Firebase Hosting (serves /build)
Analytics: Enabled (G-JX978W89X0)
```

> ⚠️ **API keys are hardcoded in `src/firebase.js`**. Move to `.env` file before any public deployment.

---

*This document should be updated as development progresses. Each completed roadmap item should be checked off and any new bugs/features should be added to the relevant sections.*
