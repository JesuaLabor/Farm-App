import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';
import { MobileBottomNav } from './MobileBottomNav';
import { HelpSupportModal } from './HelpSupportModal';
import { FarmerOnboardingModal } from './FarmerOnboardingModal';

//UAT

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('agriconnect_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('agriconnect_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed((prev) => !prev);
  const openMobileSidebar = () => setMobileOpen(true);
  const closeMobileSidebar = () => setMobileOpen(false);

  return (
    <div className="app-shell">
      {/* Left Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobileSidebar}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Wrapper (HeaderBar + Content) */}
      <div className={`app-main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <HeaderBar
          collapsed={collapsed}
          onToggleSidebar={toggleSidebar}
          onOpenMobileSidebar={openMobileSidebar}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        <main id="main-content" className="app-main-content">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Modals */}
      <HelpSupportModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <FarmerOnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
};

export default AppLayout;
