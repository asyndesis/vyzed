import { AppSidebar } from "./components/app-sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({ children, breadcrumbs, modal }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-6 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbs}
          </div>
          <ThemeSwitcher className="ml-auto mr-5" />
        </header>
        <div className="p-6 pt-0 flex-1 flex flex-col h-full gap-4">
          {children}
        </div>
      </SidebarInset>
      {modal}
    </SidebarProvider>
  );
}
