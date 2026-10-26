import { PlusCircle, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";

type FacetOption = { value: string; label: string };

export type FacetGroup = {
  label?: string;
  options: FacetOption[];
};

// Multi-select filter: a button that opens a searchable, grouped checklist
export function FacetFilter({
  title,
  icon: Icon = PlusCircle,
  groups,
  selected,
  onChange,
}: {
  title: string;
  icon?: LucideIcon;
  groups: FacetGroup[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const items = groups.map((g, i) => ({
    value: g.label ?? String(i),
    label: g.label,
    items: g.options,
  }));
  const picked = groups
    .flatMap((g) => g.options)
    .filter((o) => selected.includes(o.value));

  return (
    <Combobox
      multiple
      items={items}
      value={picked}
      onValueChange={(v: FacetOption[]) => onChange(v.map((o) => o.value))}
      itemToStringLabel={(o: FacetOption) => o.label}
      isItemEqualToValue={(a: FacetOption, b: FacetOption) =>
        a.value === b.value
      }
    >
      <ComboboxTrigger render={<Button variant="outline" />}>
        <Icon />
        {title}
        {picked.length > 0 && (
          <Badge variant="secondary">
            {picked.length > 1 ? `${picked.length} selected` : picked[0].label}
          </Badge>
        )}
      </ComboboxTrigger>
      <ComboboxContent className="w-72">
        <ComboboxInput placeholder={title} showTrigger={false} />
        <ComboboxEmpty>No results.</ComboboxEmpty>
        <ComboboxList>
          {(group: (typeof items)[number]) => (
            <ComboboxGroup key={group.value} items={group.items}>
              {group.label && <ComboboxLabel>{group.label}</ComboboxLabel>}
              <ComboboxCollection>
                {(o: FacetOption) => (
                  <ComboboxItem key={o.value} value={o}>
                    {o.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
