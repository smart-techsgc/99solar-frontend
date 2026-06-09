import { Providers } from './providers';
import { Sidebar } from './components/Sidebar';
import { ToastProvider } from '@radix-ui/react-toast';


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
        <Providers>
            <ToastProvider>
            <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:ml-64">
          {children}
        </main>
      </div>
    </div>
            </ToastProvider>
        </Providers>
  );
}