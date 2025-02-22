import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavActions } from "./nav-actions";

export function AppSidebar({ ...props }) {
  const SIDEBAR_DATA = {
    teams: [
      {
        name: "Hotdog Science",
        logo: "GalleryVerticalEnd",
        plan: "Enterprise",
      },
    ],
    projects: [
      {
        name: "Project 1",
        url: "#",
        icon: "Frame",
      },
      {
        name: "Project 2",
        url: "#",
        icon: "PieChart",
      },
      {
        name: "Project 3",
        url: "#",
        icon: "Map",
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={SIDEBAR_DATA.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavActions />

        <NavProjects projects={SIDEBAR_DATA.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
