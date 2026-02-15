import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <span className="ml-3 text-sm font-medium text-muted-foreground">
              Intelligent Money Overuse Risk Prediction
            </span>
          </header>
          <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
