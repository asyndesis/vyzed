import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@apollo/client/react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { MY_LESSONS, REQUEST_LESSON } from "@/lib/graphql";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LevelSelect } from "@/components/skill-picker";

export function RequestLessonDialog({ teacher, trigger }) {
  const navigate = useNavigate();
  const skills = teacher.teacherProfile?.skills ?? [];
  const tp = teacher.teacherProfile;
  const price = formatPrice(tp?.priceAmount, tp?.priceCurrency);

  const [open, setOpen] = useState(false);
  const [skillId, setSkillId] = useState(skills[0]?.skill.id ?? "");
  const [level, setLevel] = useState(3);
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [time, setTime] = useState("10:00");
  const [payment, setPayment] = useState(tp?.priceAmount ? "CASH" : tp?.allowBarter ? "BARTER" : "FREE");

  const skill = skills.find((s) => s.skill.id === skillId)?.skill;
  const [request, { loading }] = useMutation(REQUEST_LESSON, {
    refetchQueries: [MY_LESSONS],
  });

  const submit = async (e) => {
    e.preventDefault();
    const startTime = new Date(`${date}T${time}`);
    if (startTime < new Date()) return toast.error("Pick a time in the future");
    try {
      await request({
        variables: {
          input: {
            teacherId: teacher.id,
            skillId,
            proficiency: level,
            paymentType: payment,
            startTime,
            ...(payment === "CASH" && {
              paymentAmount: tp.priceAmount,
              paymentCurrency: tp.priceCurrency,
            }),
          },
        },
      });
      setOpen(false);
      toast.success("Request sent", {
        description: `${teacher.firstName} will confirm soon.`,
        action: { label: "View", onClick: () => navigate({ to: "/{-$locale}/dashboard/lessons" }) },
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Book {teacher.firstName}</DialogTitle>
            <DialogDescription>
              One-hour lesson. {teacher.firstName} confirms before it&apos;s set.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>What do you want to learn?</Label>
            <Select value={skillId} onValueChange={setSkillId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a skill" />
              </SelectTrigger>
              <SelectContent>
                {skills.map((s) => (
                  <SelectItem key={s.id} value={s.skill.id}>
                    {s.skill.name}
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
                min={format(new Date(), "yyyy-MM-dd")}
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
            <div className="grid grid-cols-2 gap-2">
              {[
                tp?.priceAmount
                  ? { v: "CASH", label: `Pay ${price}` }
                  : { v: "FREE", label: "Free" },
                tp?.allowBarter && { v: "BARTER", label: "Skill swap" },
              ]
                .filter(Boolean)
                .map((o) => (
                  <Button
                    key={o.v}
                    type="button"
                    variant={payment === o.v ? "default" : "outline"}
                    onClick={() => setPayment(o.v)}
                  >
                    {o.label}
                  </Button>
                ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading || !skillId}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
