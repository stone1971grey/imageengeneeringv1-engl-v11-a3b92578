import { ReactNode } from "react";
import StickyLogo from "./StickyLogo";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <StickyLogo />
      {children}
    </>
  );
};

export default Layout;