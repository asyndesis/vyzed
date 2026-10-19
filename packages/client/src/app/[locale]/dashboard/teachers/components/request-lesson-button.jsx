"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { gql, useMutation } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn, renderProficiency } from "@/lib/utils";
import { SkillFramework, PaymentType } from "@vyzed/prisma/enums";

const REQUEST_LESSON = gql`
  mutation RequestLesson($input: RequestLessonInput!) {
    requestLesson(input: $input) {
      id
    }
  }
`;

const formSchema = z.object({
  skillId: z.string().min(1, "Please select a skill"),
  proficiency: z.coerce.number().min(1).max(7),
  paymentType: z.nativeEnum(PaymentType),
  startDate: z.date(),
  startTime: z.string(),
});

export function RequestLessonButton({ user }) {
  const [open, setOpen] = useState(false);
  const [requestLesson, { loading }] = useMutation(REQUEST_LESSON);
  const [selectedSkillFramework, setSelectedSkillFramework] = useState(
    SkillFramework.DEFAULT,
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillId: "",
      proficiency: 3,
      paymentType: PaymentType.CASH,
      startDate: new Date(),
      startTime: "10:00",
    },
  });

  // Watch for changes to skillId to update the framework
  const watchedSkillId = form.watch("skillId");

  useEffect(() => {
    if (watchedSkillId) {
      const selectedSkill = user.teacherProfile.skills.find(
        (skill) => skill.skill.id === watchedSkillId,
      );

      if (selectedSkill && selectedSkill.skill.framework) {
        setSelectedSkillFramework(selectedSkill.skill.framework);
      } else {
        setSelectedSkillFramework(SkillFramework.DEFAULT);
      }
    }
  }, [watchedSkillId, user.teacherProfile.skills]);

  // Generate proficiency levels for dropdown based on the selected skill's framework
  const proficiencyLevels = [1, 2, 3, 4, 5, 6, 7].map((level) => ({
    value: level,
    label: renderProficiency({
      proficiency: level,
      framework: selectedSkillFramework,
    }),
  }));

  const handleSubmit = async (values) => {
    const startDateTime = new Date(values.startDate);
    const [hours, minutes] = values.startTime.split(":").map(Number);
    startDateTime.setHours(hours, minutes, 0);

    try {
      await requestLesson({
        variables: {
          input: {
            startTime: startDateTime,
            teacherId: user.id,
            skillId: values.skillId,
            proficiency: values.proficiency,
            paymentType: values.paymentType,
          },
        },
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error requesting lesson:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Request Lesson</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request a Lesson</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            style={{ height: "2.5rem" }}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        style={{ height: "2.5rem" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="skillId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {user.teacherProfile.skills.map((skill) => (
                          <SelectItem key={skill.id} value={skill.skill.id}>
                            {skill.skill.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proficiency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Proficiency</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proficiency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proficiencyLevels.map((level) => (
                          <SelectItem
                            key={level.value}
                            value={level.value.toString()}
                          >
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentType.CASH}>Cash</SelectItem>
                      <SelectItem value={PaymentType.BARTER}>
                        Skill Exchange
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Requesting..." : "Request Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
