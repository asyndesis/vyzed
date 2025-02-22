"use client";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import { Skeleton } from "@/components/ui/skeleton";

const sequenceBatchesQuery = gql`
  query sequenceBatches {
    sequenceBatches {
      id
      name
      sequences {
        id
      }
    }
  }
`;

export function NavSequenceBatchess() {
  const { data, loading } = useQuery(sequenceBatchesQuery);

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible asChild defaultOpen={true} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Sequences">
                <Icon iconName="SquareTerminal" />
                <span>Sequences</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  data?.sequenceBatches?.map?.(
                    ({ name, id, sequences } = {}) => {
                      const isSingle = sequences.length === 1;
                      const href = isSingle
                        ? `/dashboard/sequence/${sequences[0].id}`
                        : `/dashboard/sequence-batch/${id}`;
                      return (
                        <SidebarMenuSubItem key={id}>
                          <SidebarMenuSubButton asChild>
                            <Link href={href}>
                              <span>
                                {name} ({sequences?.length ?? 0})
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    }
                  )
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
