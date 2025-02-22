"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { gql, useMutation } from "@apollo/client";

const createSequenceBatchMutation = gql`
  mutation createSequenceBatch($input: CreateSequenceBatchInput!) {
    createSequenceBatch(input: $input) {
      id
      name
    }
  }
`;

const schema = z.object({
  name: z.string().min(1, { message: "Please give your sequence a name" }),
  species: z
    .string()
    .min(1, { message: "Please choose a species for your sequence" }),
});

export const AddSequenceForm = () => {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      species: "",
    },
  });

  const [createSequenceBatch, { loading }] = useMutation(
    createSequenceBatchMutation,
    {
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to add the sequence. Please try again.",
          variant: "destructive",
        });
      },
      onCompleted: () => {
        toast({
          title: "Success",
          description: "Sequence added successfully!",
        });
        form.reset();
      },
    }
  );

  const onSubmit = async (payload) => {
    await createSequenceBatch({
      variables: {
        input: payload,
      },
      refetchQueries: ["sequenceBatches"],
    });
  };

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      const firstError = Object.values(form.formState.errors)[0];
      toast({
        title: "Validation Error",
        description: firstError?.message || "Please correct the errors.",
        variant: "destructive",
      });
    }
  }, [form.formState.errors]);

  return (
    <Form {...form}>
      <Card className="max-w-[800px] w-full pt-6">
        <form className="contents" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormItem>
                    <Textarea
                      rows={8}
                      placeholder="Type (or copy-paste) your nucleotide sequence(s) here..."
                      className={
                        error ? "border-red-500 focus:ring-red-500" : ""
                      }
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <small
                      className={`${error ? "text-red-500" : ""} text-xs font-medium leading-none text-muted-foreground text-right block`}
                    >
                      Length: {field?.value?.length}
                    </small>
                  </FormItem>
                );
              }}
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <FormField
              control={form.control}
              name="species"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={`w-[150px] ${
                          error ? "border-red-500 focus:ring-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select a species" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="human">Human</SelectItem>
                      <SelectItem value="horse">Horse</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button
              disabled={loading}
              type="submit"
              className="flex items-center gap-2"
            >
              <Plus />
              <span>Add Sequence</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Form>
  );
};
