import { createContext, PropsWithChildren, useContext } from "react";
import { useWindowDimensions } from "react-native";

type ResponsiveContextValue = {
  isDesktop: boolean;
  isMobile: boolean;
  width: number;
};

const ResponsiveContext = createContext<ResponsiveContextValue | null>(null);

export function ResponsiveProvider({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  const desktopBreakpoint = 768;
  const value = {
    isDesktop: width > desktopBreakpoint,
    isMobile: width <= desktopBreakpoint,
    width,
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsive() {
  const context = useContext(ResponsiveContext);

  if (!context) {
    throw new Error("useResponsive must be used inside ResponsiveProvider.");
  }

  return context;
}
