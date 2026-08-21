import { useEffect } from "react";
import { apiGet } from "../api/client";
import { usePageStore } from "../store/usePageStore";

const DEFAULT_SITE_TITLE = "Kaina Fresh LTD";
const DEFAULT_FAVICON = "/favicon.svg";

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

function resolveLogoUrl(rawLogoPath: string) {
  if (/^https?:\/\//.test(rawLogoPath)) return rawLogoPath;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return `${API_BASE}${rawLogoPath.startsWith("/") ? "" : "/"}${rawLogoPath}`;
}


export function usePageTitle(slug: string, fallbackTitle?: string) {
  const pages = usePageStore((state) => state.pages);
  const fetchPages = usePageStore((state) => state.fetchPages);

  useEffect(() => {
    if (pages.length === 0) fetchPages();
  }, [pages.length, fetchPages]);

  useEffect(() => {
    let cancelled = false;

    apiGet<any>("/api/settings")
      .then((res) => {
        if (cancelled) return;
        const data = res?.data ?? (Array.isArray(res) ? res[1] : res);
        const siteTitle = data?.site_title || DEFAULT_SITE_TITLE;
        const pageTitle = pages.find((p) => p.slug === slug)?.title ?? fallbackTitle ?? slug;
        document.title = `${siteTitle} - ${pageTitle}`;
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
