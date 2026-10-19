"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import {
  CalendarDays,
  ChevronsUpDown,
  Home,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Sun,
  GraduationCap,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { MY_LESSONS } from "@/lib/graphql";
import { fullName } from "@/lib/format";
import { useMe } from "@/hooks/use-me";
import { UserAvatar } from "@/components/user-avatar";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Strip the locale prefix so active matching works for /en/dashboard etc.
const stripLocale = (p) => p.replace(/^\/(en|de|es)(?=\/|$)/, "") || "/";

const NAV = [
  { title: "Home", url: "/dashboard", icon: Home, exact: true, auth: true },
  { title: "Lessons", url: "/dashboard/lessons", icon: CalendarDays, auth: true, badge: "pending" },
  { title: "Find teachers", url: "/dashboard/teachers", icon: GraduationCap },
  { title: "Profile", url: "/dashboard/profile", icon: UserRound, auth: true },
];

function Logo() {
  return (
    <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 6l7 12 7-12" />
      </svg>
    </span>
  );
}

// Compact profile progress for signed-in users, hidden when collapsed or complete
function ProfileProgress() {
  const pathname = stripLocale(usePathname());
  const { me } = useMe();
  if (!me || pathname === "/dashboard/profile") return null;
  const steps = [
    me.userProfile?.languages?.length,
    me.studentProfile?.skills?.length,
    me.teacherProfile?.skills?.length,
    me.userProfile?.bio,
  ];
  const done = steps.filter(Boolean).length;
  if (done === steps.length) return null;

  return (
    <Link
      href="/dashboard/profile"
      className="block rounded-lg border bg-background p-3 transition-colors hover:border-primary/40 group-data-[collapsible=icon]:hidden"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Finish your profile</span>
        <span className="tabular-nums text-xs text-muted-foreground">
          {done}/{steps.length}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Complete profiles get more requests.</p>
    </Link>
  );
}

// Cycles light → dark → system. Icon only renders after mount (theme is client-only)
const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const i = Math.max(0, THEMES.findIndex((t) => t.value === theme));
  const current = mounted ? THEMES[i] : THEMES[2];
  const next = THEMES[(i + 1) % THEMES.length];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setTheme(next.value)} tooltip={`Theme: ${current.label}`}>
          <current.icon />
          <span>Theme</span>
          <span className="ml-auto text-xs text-muted-foreground">{mounted ? current.label : ""}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Guest call-to-action in the sidebar, hidden when collapsed
function JoinCard() {
  return (
    <div className="rounded-lg border bg-background p-3 group-data-[collapsible=icon]:hidden">
      <p className="text-sm font-medium">Teach what you know</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Join free and swap lessons with people nearby.
      </p>
      <Button asChild size="sm" className="mt-3 w-full">
        <Link href="/sign-up">Create account</Link>
      </Button>
    </div>
  );
}

// Lessons waiting on me: requests to my lessons, or revisions to my enrollments
export function usePendingCount(enabled) {
  const { data } = useQuery(MY_LESSONS, { skip: !enabled });
  if (!data) return 0;
  return (
    data.myLessonsAsTeacher.filter((l) => l.status === "REQUESTED").length +
    data.myLessonsAsStudent.filter((l) => l.enrollments[0]?.status === "REVISED").length
  );
}

function UserMenu() {
  const router = useRouter();
  const { me, signedIn, loading } = useMe();

  // Reserve the row's height without random-width skeletons (they break hydration)
  if (loading) return <div className="h-12" />;

  if (!signedIn)
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Sign in">
            <Link href="/sign-in">
              <LogIn />
              <span>Sign in</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );

  const signOut = () =>
    authClient.signOut({ fetchOptions: { onSuccess: () => router.replace("/sign-in") } });

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
                <span className="truncate text-xs text-muted-foreground">{me?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" sideOffset={4} className="w-56 rounded-lg">
            <DropdownMenuLabel className="font-normal text-muted-foreground">
              {me?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
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

export function AppShell({ children }) {
  const pathname = stripLocale(usePathname());
  const { signedIn, sessionPending } = useMe();
  const pending = usePendingCount(signedIn);

  const isActive = (item) =>
    item.exact ? pathname === item.url : pathname.startsWith(item.url);

  const current = NAV.filter(isActive).at(-1);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href={signedIn ? "/dashboard" : "/"}>
                  <Logo />
                  <span className="font-display text-base font-semibold">vyzed</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {/* Show the full nav while the session resolves; most visitors are signed in */}
              {NAV.filter((i) => sessionPending || signedIn || !i.auth).map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive(item)} tooltip={item.title}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge === "pending" && pending > 0 && (
                        <SidebarMenuBadge>{pending}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {!sessionPending && !signedIn && <JoinCard />}
          <ProfileProgress />
          <ThemeToggle />
          <UserMenu />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {/* Mobile only: desktop navigation lives entirely in the sidebar */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:hidden">
          <SidebarTrigger className="-ml-1 text-muted-foreground" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium">{current?.title ?? "Vyzed"}</span>
          {!sessionPending && !signedIn && (
            <Button asChild size="sm" className="ml-auto">
              <Link href="/sign-up">Join Vyzed</Link>
            </Button>
          )}
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-6 md:px-10 md:py-10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
