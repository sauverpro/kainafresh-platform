/**
 * ============================================================================
 * KainaFresh Organic Platform — Dynamic SEO Page Title & Favicon Hook
 * ============================================================================
 * 
 * Features:
 * 1. Queries backend settings for site title & logo icon.
 * 2. Dynamically sets document.title (e.g. "KainaFresh - Our Farm").
 * 3. Dynamically updates browser head favicon element with uploaded site logo.
 */

// Import React lifecycle hook
import { useEffect } from "react";

// Import API client for fetching global site title & logo settings
import { apiGet } from "../api/client";

// Import Zustand global page store
import { usePageStore } from "../store/usePageStore";

// Default fallback values
const DEFAULT_SITE_TITLE = "Kaina Fresh LTD";
const DEFAULT_FAVICON = "/favicon.svg";

/**
 * Helper function to dynamically update or inject <link rel="icon"> in DOM head.
 */
function setFavicon(href: string) {
  const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (link) {
    link.href = href;
  } else {
    const newLink = document.createElement("link");
    newLink.rel = "icon";
    newLink.href = href;
    document.head.appendChild(newLink);
  }
}

/**
 * Helper function to resolve absolute logo URL path.
 */
function resolveLogoUrl(rawLogoPath: string) {
  if (/^https?:\/\//.test(rawLogoPath)) return rawLogoPath;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return `${API_BASE}${rawLogoPath.startsWith("/") ? "" : "/"}${rawLogoPath}`;
}

/**
 * Custom React Hook: usePageTitle
 * Automatically manages document HTML title and favicon based on page slug and DB settings.
 */
export function usePageTitle(slug: string, fallbackTitle?: string) {
  const pages = usePageStore((state) => state.pages);
  const fetchPages = usePageStore((state) => state.fetchPages);

  // Fetch page list if empty
  useEffect(() => {
    if (pages.length === 0) fetchPages();
  }, [pages.length, fetchPages]);

  // Update document title and favicon on slug or settings change
  useEffect(() => {
    let cancelled = false;

    // Fetch site title & logo settings from MariaDB
    apiGet<any>("/api/settings")
      .then((res) => {
        if (cancelled) return;
        const data = res?.data ?? (Array.isArray(res) ? res[1] : res);
        const siteTitle = data?.site_title || DEFAULT_SITE_TITLE;
        const pageTitle = pages.find((p) => p.slug === slug)?.title ?? fallbackTitle ?? slug;
        
        // Update document title tag
        document.title = `${siteTitle} - ${pageTitle}`;

        // Update favicon tag with uploaded site logo
        setFavicon(data?.site_logo ? resolveLogoUrl(data.site_logo) : DEFAULT_FAVICON);
      })
      .catch(() => {
        if (cancelled) return;
        const pageTitle = pages.find((p) => p.slug === slug)?.title ?? fallbackTitle ?? slug;
        document.title = `${DEFAULT_SITE_TITLE} - ${pageTitle}`;
      });

    return () => {
      cancelled = true;
    };
  }, [slug, fallbackTitle, pages]);
}
