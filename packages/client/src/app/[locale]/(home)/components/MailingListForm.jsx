"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useMutation, gql } from "@apollo/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const ADD_TO_MAILING_LIST = gql`
  mutation AddToMailingList($input: AddToMailingListInput!) {
    addToMailingList(input: $input)
  }
`;

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  // Honeypot field - should always be empty
  fullName: z
    .string()
    .length(0, { message: "This field must be empty" })
    .optional(),
});

export function MailingListForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "", // Honeypot field starts empty
    },
  });

  const [addToMailingList, { loading }] = useMutation(ADD_TO_MAILING_LIST, {
    onCompleted: () => {
      toast.success("Thanks so much! We'll let you know when we launch.");
      form.reset();
    },
    onError: (error) => {
      console.error("Error submitting email:", error);
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const onSubmit = async (values) => {
    // Check honeypot field - if it's filled, silently "succeed" without submitting
    if (values.fullName) {
      // Simulate success for bots without making an actual submission
      setTimeout(() => {
        toast.success("Thanks so much! We'll let you know when we launch.");
        form.reset();
      }, 500);
      return;
    }

    // Only real users should get here
    addToMailingList({
      variables: {
        input: { email: values.email },
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-4 pl-5 pr-12 border border-input/40 bg-background/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
                  disabled={loading}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage className="text-left text-sm mt-1" />
            </FormItem>
          )}
        />

        {/* Honeypot field - hidden from human users but visible to bots */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem
              style={{ display: "none", position: "absolute", left: "-9999px" }}
            >
              <FormControl>
                <input
                  {...field}
                  type="text"
                  tabIndex="-1"
                  autoComplete="off"
                  aria-hidden="true"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-primary/20 py-6 rounded-xl transition-all duration-300"
        >
          <span className="font-medium">
            {loading ? "Submitting..." : "Let me know!"}
          </span>
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </form>
    </Form>
  );
}
