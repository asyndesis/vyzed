import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HomeIcon, UsersIcon } from "lucide-react";
import { getSession } from "@/lib/session";

export async function AppSidebar() {
  const session = await getSession();
  const isAuthenticated = !!session;

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: HomeIcon,
      isActive: true,
    },
    {
      title: "Teachers",
      url: "/dashboard/teachers",
      icon: UsersIcon,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>{isAuthenticated && <NavUser />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
