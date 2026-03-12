import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import BottomNav from './BottomNav';
import Header from './Header';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 px-4 md:px-6 py-4 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
