import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronsUpDown,
  GraduationCap,
  Home,
  LogOut,
  UserRound,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth-client";
import { fullName } from "@/lib/format";
import { useMyLessons } from "@/lib/lessons";
import { meQuery } from "@/lib/queries";
import { viewerQuery } from "@/lib/session";

const NAV = [
  { title: "Home", to: "/dashboard", icon: Home, exact: true },
  { title: "Lessons", to: "/dashboard/lessons", icon: CalendarDays },
  { title: "Find teachers", to: "/dashboard/teachers", icon: GraduationCap },
  { title: "Profile", to: "/dashboard/profile", icon: UserRound },
] as const;

// What a complete profile has; shared by the sidebar card
export function profileSteps(
  me: { bio?: string | null; skills: ReadonlyArray<{ kind: string }> } | null,
) {
  const has = (kind: string) => !!me?.skills.some((s) => s.kind === kind);
  return [has("speaks"), has("learns"), has("teaches"), !!me?.bio?.trim()];
}

function ProfileProgress() {
  const matchRoute = useMatchRoute();
  const { data } = useSuspenseQuery(meQuery);
  const steps = profileSteps(data.me);
  const done = steps.filter(Boolean).length;
  if (matchRoute({ to: "/dashboard/profile" }) || done === steps.length)
    return null;

  return (
    <Link
      to="/dashboard/profile"
      className="block rounded-lg border bg-background p-3 transition-colors group-data-[collapsible=icon]:hidden hover:border-foreground/20"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Finish your profile</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {done}/{steps.length}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Complete profiles get more requests.
      </p>
    </Link>
  );
}

function UserMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(meQuery);
  const me = data.me;
  if (!me) return null;

  const signOut = async () => {
    await authClient.signOut();
    await queryClient.resetQueries({ queryKey: viewerQuery.queryKey });
    navigate({ to: "/sign-in" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar user={me} className="size-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName(me)}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {me.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={4}
            className="w-56 rounded-lg"
          >
            <DropdownMenuLabel className="font-normal text-muted-foreground">
              {me.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile">
                <UserRound /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={signOut}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppShell({
  defaultOpen,
  children,
}: {
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const matchRoute = useMatchRoute();
  const { groups } = useMyLessons();
  const pending = groups.action.length;
  const isActive = (item: (typeof NAV)[number]) =>
    !!matchRoute({ to: item.to, fuzzy: !("exact" in item) });
  const current = NAV.filter(isActive).at(-1);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/dashboard">
                  <LogoMark className="bg-sidebar-primary text-sidebar-primary-foreground" />
                  <span className="font-display text-base font-semibold">
                    vyzed
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item)}
                    tooltip={item.title}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.to === "/dashboard/lessons" && pending > 0 && (
                    <SidebarMenuBadge>{pending}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ProfileProgress />
          <UserMenu />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {/* Mobile only: on desktop all navigation lives in the sidebar */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden">
          <SidebarTrigger className="-ml-1 text-muted-foreground" />
          <Separator orientation="vertical" className="mr-2 h-4!" />
          <span className="text-sm font-medium">
            {current?.title ?? "Vyzed"}
          </span>
        </header>
        <div className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-6 md:px-10 md:py-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
