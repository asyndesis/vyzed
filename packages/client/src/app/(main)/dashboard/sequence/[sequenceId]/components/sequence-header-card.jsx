"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date-utils";
import { ScrollSequence } from "@/components/scroll-sequence";
import { Icon } from "@/components/ui/icon";
import { useQueryParams } from "@/hooks/use-query-params";

const SequenceAttribute = ({ value, type, iconName }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={
          "flex items-center justify-center w-12 h-12 bg-background rounded-full"
        }
      >
        <Icon iconName={iconName} />
      </div>
      <div>
        <div>{value}</div>
        <div className="text-muted-foreground text-sm">{type}</div>
      </div>
    </div>
  );
};

export function SequenceHeaderCard({ sequence }) {
  const { updateParams } = useQueryParams();
  return (
    <Card className="w-full sticky top-4 z-10 bg-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          &gt; {sequence?.name}
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-full"
            onClick={() => updateParams({ action: "edit" })}
          >
            <Icon iconName="Pencil" />
          </Button>
        </CardTitle>
        <CardDescription>
          Added on: {formatDate(sequence?.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollSequence>
          CCCTGCACTTGGATAGGGGATTATCTCGTAAGGCAAGCTCGTACCGTCATTCATGCGGAAGAGTTAACACGATTGGAAGTAGGGATAGTTTCGAACCTCGGTTACTAGTCCTAATAAGGGAACGCTGTCTGAAGGATGAGTGTCAGCCAGTGTAACCCGATGAGCTACCCAGTAGTCGAACTGGGCCAGACAACCCGGCGCTAATGCACTCAATCCCGAGGCCTGACGCGACATATCAGCTAAGAGTAGGCCGGGGGTGTAGACCTTTGGGGTTGAATAAATCTATTGTACTAATCGGCTCCCTGCACTTGGATAGGGGATTATCTCGTAAGGCAAGCTCGTACCGTCATTCATGCGGAAGAGTTAACACGATTGGAAGTAGGGATAGTTTCGAACCTCGGTTACTAGTCCTAATAAGGGAACGCTGTCTGAAGGATGAGTGTCAGCCAGTGTAACCCGATGAGCTACCCAGTAGTCGAACTGGGCCAGACAACCCGGCGCTAATGCACTCAATCCCGAGGCCTGACGCGACATATCAGCTAAGAGTAGGCCGGGGGTGTAGACCTTTGGGGTTGAATAAATCTATTGTACTAATCGGCTCCCTGCACTTGGATAGGGGATTATCTCGTAAGGCAAGCTCGTACCGTCATTCATGCGGAAGAGTTAACACGATTGGAAGTAGGGATAGTTTCGAACCTCGGTTACTAGTCCTAATAAGGGAACGCTGTCTGAAGGATGAGTGTCAGCCAGTGTAACCCGATGAGCTACCCAGTAGTCGAACTGGGCCAGACAACCCGGCGCTAATGCACTCAATCCCGAGGCCTGACGCGACATATCAGCTAAGAGTAGGCCGGGGGTGTAGACCTTTGGGGTTGAATAAATCTATTGTACTAATCGGCT
        </ScrollSequence>
        <div className="flex gap-8 items-center pt-4">
          <SequenceAttribute value="Heavy Chain" type="Chain" />
          <SequenceAttribute value="Homo Sapian" type="Species" />
          <SequenceAttribute value="IgG3" type="Isotype & Subclass" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 bg-indigo-100 py-4">
        <div className="flex items-center">
          <Button variant="outline" className={"rounded-r-none"}>
            Optimize and clone
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={"rounded-l-none border-l-0 px-2"}
              >
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Clone</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              Actions <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Phylogeny</DropdownMenuItem>
            <DropdownMenuItem>Numbering</DropdownMenuItem>
            <DropdownMenuItem>Collier de Perles</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
