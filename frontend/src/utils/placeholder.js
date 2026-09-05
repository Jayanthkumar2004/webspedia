// Reliable inline SVG placeholders and image fallbacks to prevent net::ERR_CONNECTION_CLOSED errors

export const DEFAULT_TOOL_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%236366f1" rx="22"/><text x="50" y="56" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="28" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle">AI</text></svg>`;

export const DEFAULT_BANNER_IMAGE = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`;

export const handleImageError = (e, fallback = DEFAULT_TOOL_ICON) => {
  if (e.target && e.target.src !== fallback) {
    e.target.onerror = null;
    e.target.src = fallback;
  }
};
