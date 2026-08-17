# KainaFresh — Brand Guide

> This document is the **single source of truth** for all team members: frontend developers, backend developers, and designers. Read this before writing any code or creating any UI.

---

## 1. Brand Overview

**KainaFresh** is a farm-to-table e-commerce platform that sells fresh agricultural produce directly from the farm to customers. The brand values are:

- **Freshness** — produce that is alive, vibrant, and direct from the source
- **Trust** — a transparent, honest farm brand customers can rely on
- **Community** — connecting local farmers with local buyers
- **Quality** — premium produce at fair prices

The platform functions as both a **CMS (Content Management System)** and an **IMS (Inventory Management System)**. Every piece of visible content on the website — hero text, product listings, FAQs, banners — is managed and editable via the Admin Panel. **Nothing is hardcoded.**

---

## 2. Color Palette

All colors are defined as CSS variables in `frontend/src/index.css`.

| Name | CSS Variable | Hex | Usage |
|------|-------------|-----|-------|
| Farm Green (Primary) | `--color-primary` | `#076935` | Main brand color, primary buttons, headings, active states |
| Harvest Orange (Secondary) | `--color-secondary` | `#F39927` | Accents, CTAs, highlights, badges, hover states |
| Off-White Background | `--color-background` | `#FFFDF9` | Page background, warm neutral |
| Dark Text | `--color-text-dark` | `#1F2937` | Headings, labels, body text |
| Muted Text | `--color-text-light` | `#6B7280` | Subtitles, descriptions, placeholders |
| Success | `--color-success` | `#10B981` | Form success states, order confirmations |
| Error | `--color-error` | `#EF4444` | Form validation errors, destructive actions |
| White | — | `#FFFFFF` | Card backgrounds, form surfaces |

### Usage Rules

- **Never** use raw red, raw blue, or generic grays — always use the palette above.
- Primary green is used for **trust and structure** (navigation, footers, primary CTAs).
- Orange is used for **energy and urgency** ("Order Now", "Limited Stock", promo badges).
- Orange should never dominate — use it as an accent, not a background fill on large areas.

---

## 3. Typography

All fonts are loaded from Google Fonts in `frontend/src/index.css`.

| Font | CSS Variable | Usage |
|------|-------------|-------|
| Space Grotesk | `--font-heading` | All headings (h1–h4), navigation links, buttons, labels |
| Google Sans | `--font-body` | Body text, paragraphs, descriptions, form inputs |

### Type Scale

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Hero Heading (h1) | Space Grotesk | 3.5rem – 4.5rem | 700 |
| Section Heading (h2) | Space Grotesk | 2rem – 2.5rem | 700 |
| Card Heading (h3) | Space Grotesk | 1.25rem – 1.5rem | 600 |
| Body Text | Google Sans | 1rem | 400 |
| Small / Caption | Google Sans | 0.875rem | 400 |
| Button | Space Grotesk | 1rem | 600 |
| Nav Links | Space Grotesk | 1rem | 600 |

### Rules
- **Never** use the browser default font. Always inherit from `--font-heading` or `--font-body`.
- Line height for body text: `1.6`. Line height for headings: `1.1–1.2`.

---

## 4. Spacing & Layout System

- **Base unit:** `0.25rem` (4px)
- **Standard section padding:** `5rem 5%` (vertical / horizontal)
- **Card padding:** `1.5rem – 2rem`
- **Button padding:** `0.75rem 1.5rem`
- **Border radius:**
  - Buttons: `50px` (pill shape)
  - Cards: `16px`
  - Input fields: `10px`
  - Large hero shapes: `24px – 30px`
- **Max content width:** `1200px` — center with `margin: 0 auto`

---

## 5. Component Style Rules

### Buttons

Two primary button types defined as global CSS classes in `index.css`:

```html
<!-- Primary (Green) -->
<button class="btn btn-primary">Shop Now</button>

<!-- Secondary (Orange) -->
<button class="btn btn-secondary">Learn More</button>
```

- Always pill-shaped (`border-radius: 50px`)
- Font: Space Grotesk, 600 weight
- Hover: subtle `scale(1.05)` + darker shade
- Loading state: show a spinner inside the button, disable clicks

### Cards

```html
<div class="card">Content</div>
```

- White background, `border-radius: 16px`
- Soft shadow on rest, elevated shadow on hover
- Hover: `translateY(-5px)` lift effect

### Form Inputs

- Border: `1.5px solid #E5E7EB`
- Border on focus: `1.5px solid var(--color-primary)`
- Border-radius: `10px`
- Padding: `0.85rem 1rem`
- Font: Google Sans
- Error state: border becomes `var(--color-error)`, show error message below in red

---

## 6. Aesthetic Rules

KainaFresh has a **playful yet corporate** feel. This means:

- **Slanted / diagonal backgrounds** on hero sections (not just flat rectangles)
- **Overlapping elements** (cards floating over images or colored sections)
- **Micro-animations** on all interactive elements (buttons, cards, nav links)
- **No harsh shadows** — always use soft, diffuse shadows
- **Vibrant imagery** — produce photography should be bright and warm
- Avoid flat, minimal design — the UI should feel alive and energetic

---

## 7. Frontend File & Folder Structure

```
frontend/src/
├── api/
│   └── client.js              # All API calls go through here
├── components/
│   ├── Navbar/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   └── Footer/
│       └── Footer.jsx
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   ├── Login.css
│   │   ├── Signup.jsx
│   │   └── Signup.css
│   ├── Home/
│   │   ├── Home.jsx
│   │   ├── Home.css
│   │   └── sections/
│   │       ├── HeroSection.jsx
│   │       ├── ProductsSection.jsx
│   │       ├── ValueProposition.jsx
│   │       └── FAQSection.jsx
│   ├── About/
│   │   └── About.jsx
│   ├── Contact/
│   │   └── Contact.jsx
│   └── Admin/
│       └── Admin.jsx          # Protected — requires auth token
├── App.jsx                    # Routing only
├── index.css                  # Global design system
└── main.jsx
```

### Naming Conventions

- **Components & Pages:** PascalCase (e.g., `HeroSection.jsx`, `Login.jsx`)
- **CSS files:** Same name as component (e.g., `Login.css` for `Login.jsx`)
- **Utility files:** camelCase (e.g., `client.js`)
- **Props:** camelCase (e.g., `heroTitle`, `isLoading`)

---

## 8. Routing Map

| Route | Component | Auth Required |
|-------|-----------|---------------|
| `/` | `Home.jsx` | No |
| `/login` | `Login.jsx` | No |
| `/signup` | `Signup.jsx` | No |
| `/about` | `About.jsx` | No |
| `/contact` | `Contact.jsx` | No |
| `/admin/*` | `Admin.jsx` | ✅ Yes |

The Admin route is protected by a `ProtectedRoute` component in `App.jsx`. If a user tries to access `/admin` without a valid token in `localStorage`, they are redirected to `/login`.

---

## 9. CMS Approach — Dynamic Content

**Every visible text, image, and configuration on the public-facing site must come from the API.** The frontend renders what the backend returns. This allows the client to edit everything via the Admin Panel without touching code.

Examples of CMS-driven content:
- Hero section: title, subtitle, button text, background image URL
- Products section: list of featured products (name, price, image, stock status)
- FAQ section: list of question/answer pairs
- About Us page: story text, team members, farm images
- Contact page: address, phone, email, map embed URL
- Navigation: site logo URL, nav link labels

See `API_CONTRACT.md` for the exact endpoint shapes the backend must provide.

---

## 10. Authentication Flow

1. User submits Login form → `POST /api/login` via `api/client.js`
2. On success: store returned `token` in `localStorage` as `kainafresh_token`
3. Every subsequent protected API call includes: `Authorization: Bearer <token>`
4. On logout: delete `kainafresh_token` from `localStorage` and redirect to `/login`
5. `ProtectedRoute` in `App.jsx` checks for `kainafresh_token` on every render of a protected route

---

## 11. API Client Usage

All API calls must go through `src/api/client.js`. **Never write `fetch()` directly in a component.**

```js
// ✅ Correct
import { apiPost } from '../api/client';
const response = await apiPost('/login', { email, password });

// ❌ Incorrect — don't do this in components
const response = await fetch('http://localhost/kainafresh/public/api/login', { ... });
```

The base URL is set via the `.env` file variable `VITE_API_BASE_URL`. Update the `.env` file when the backend team finalises the server URL.

---

## 12. Icon Library

**Lucide React** is the official icon library for KainaFresh.

Install: `npm install lucide-react`

Usage — import only the icons you need (tree-shakeable):

```jsx
import { Leaf, ShoppingCart, Eye, EyeOff, Menu } from 'lucide-react';

<Leaf size={24} color="var(--color-primary)" strokeWidth={2} />
```

### Rules
- Default size: **20px** for inline/body icons, **24px** for standalone/action icons
- Default `strokeWidth`: **2**
- Color: always use CSS variables — never hardcode hex values in JSX
- Browse all available icons at: https://lucide.dev/icons
