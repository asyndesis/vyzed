import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LevelSelect } from "@/components/level-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatPrice } from "@/lib/format";
import {
  gqlRequest,
  graphql,
  readFragment,
  type FragmentOf,
  type VariablesOf,
} from "@/lib/gql";

export const BookableTeacherFields = graphql(`
  fragment BookableTeacherFields on User {
    id
    firstName
    priceAmount
    priceCurrency
    allowBarter
    teaches: skills(kind: teaches) {
      skill {
        id
        name
        framework
      }
    }
  }
`);

const RequestLesson = graphql(`
  mutation RequestLesson($input: RequestLessonInput!) {
    requestLesson(input: $input) {
      id
    }
  }
`);

type PaymentType = VariablesOf<typeof RequestLesson>["input"]["paymentType"];

const dayFromNow = (days: number) =>
  format(addDays(new Date(), days), "yyyy-MM-dd");

export function RequestLessonDialog({
  data,
  trigger,
}: {
  data: FragmentOf<typeof BookableTeacherFields>;
  trigger: React.ReactElement;
}) {
  const teacher = readFragment(BookableTeacherFields, data);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const price = formatPrice(teacher.priceAmount, teacher.priceCurrency);

  // What the teacher accepts; the server re-checks and sets the price
  const options: Array<{ value: PaymentType; label: string }> = [
    price
      ? { value: "CASH", label: `Pay ${price}` }
      : { value: "FREE", label: "Free" },
    ...(teacher.allowBarter
      ? [{ value: "BARTER" as const, label: "Skill swap" }]
      : []),
  ];

  const [open, setOpen] = useState(false);
  // Dates come from the clock when the dialog opens, never during render
  const [today, setToday] = useState("");
  const onOpenChange = (o: boolean) => {
    if (o) {
      setToday(dayFromNow(0));
      setDate((d) => d || dayFromNow(1));
    }
    setOpen(o);
  };
  const [skillId, setSkillId] = useState(teacher.teaches[0]?.skill.id ?? "");
  const [level, setLevel] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [payment, setPayment] = useState<PaymentType>(options[0].value);
  const skill = teacher.teaches.find((s) => s.skill.id === skillId)?.skill;

  const request = useMutation({
    mutationFn: () =>
      gqlRequest(RequestLesson, {
        input: {
          teacherId: teacher.id,
          skillId,
          proficiency: level,
          paymentType: payment,
          startTime: new Date(`${date}T${time}`).toISOString(),
        },
      }),
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["MyLessons"] });
      toast.success("Request sent", {
        description: `${teacher.firstName} will confirm soon.`,
        action: {
          label: "View",
          onClick: () => navigate({ to: "/dashboard/lessons" }),
        },
      });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            request.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>Book {teacher.firstName}</DialogTitle>
            <DialogDescription>
              One-hour lesson. {teacher.firstName} confirms before it's set.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>What do you want to learn?</Label>
            <Select value={skillId} onValueChange={(v) => setSkillId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a skill" />
              </SelectTrigger>
              <SelectContent>
                {teacher.teaches.map(({ skill }) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Your current level</Label>
            <LevelSelect
              value={level}
              onChange={setLevel}
              framework={skill?.framework}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                min={today || undefined}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                step={900}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment</Label>
            <ToggleGroup
              variant="outline"
              value={[payment]}
              onValueChange={([v]) => v && setPayment(v as PaymentType)}
              className="grid w-full grid-cols-2"
            >
              {options.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={request.isPending || !skillId}
            >
              {request.isPending && <Loader2 className="animate-spin" />}
              Send request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
