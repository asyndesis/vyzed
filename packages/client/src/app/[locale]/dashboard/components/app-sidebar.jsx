import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HomeIcon, SettingsIcon, UsersIcon } from "lucide-react";
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
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon,
      items: [
        {
          title: "Profile Settings",
          url: "/dashboard/settings/profile",
        },
        {
          title: "Account Settings",
          url: "/dashboard/settings/account",
        },
        {
          title: "Notification Settings",
          url: "/dashboard/settings/notifications",
        },
      ],
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
