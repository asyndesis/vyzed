"use client";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

function AddSequenceButton() {
  return (
    <Link href="/dashboard/sequence/add" passHref>
      <Button className="w-full flex items-center gap-2">
        <Plus />
        <span className="group-data-[collapsible=icon]:hidden">
          Add Sequence
        </span>
      </Button>
    </Link>
  );
}

function SearchBar() {
  return (
    <div className="relative w-full">
      <SidebarMenuButton className="w-full justify-center group-data-[collapsible=icon]:flex hidden">
        <Search />
      </SidebarMenuButton>
      <Input
        type="search"
        className="group-data-[collapsible=icon]:hidden"
        iconLeft={<Search className="h-4 w-4" />}
        placeholder="Search..."
      />
    </div>
  );
}

export function NavActions() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem className="mb-1">
          <SearchBar />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <AddSequenceButton />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
