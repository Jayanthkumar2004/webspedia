import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage lazily to prevent state reset on component re-render
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Apply theme class to document.body and update localStorage
  useEffect(() => {
    const body = document.body;
    body.classList.remove("light", "dark");
    body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if not inside Provider
    return {
      theme: localStorage.getItem("theme") || "dark",
      setTheme: (t) => {
        document.body.classList.remove("light", "dark");
        document.body.classList.add(t);
        localStorage.setItem("theme", t);
      },
      toggleTheme: () => {}
    };
  }
  return context;
};