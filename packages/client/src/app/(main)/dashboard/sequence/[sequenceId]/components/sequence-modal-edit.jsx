"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQueryParams } from "@/hooks/use-query-params";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { gql, useMutation } from "@apollo/client";
import { toast } from "@/hooks/use-toast";

const updateSequenceMutation = gql`
  mutation updateSequence($id: ObjectID!, $input: UpdateSequenceInput!) {
    updateSequence(id: $id, input: $input) {
      id
      name
    }
  }
`;

export function SequenceModalEdit({ sequence }) {
  const { params, updateParams } = useQueryParams();

  const form = useForm({
    defaultValues: {
      name: sequence?.name || "",
    },
    mode: "onChange",
  });

  const [updateSequence, { loading }] = useMutation(updateSequenceMutation, {
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
      form.reset({ name: sequence.name });
    },
  });

  const onSubmit = async (payload) => {
    await updateSequence({
      variables: {
        id: sequence?.id,
        input: payload,
      },
      refetchQueries: ["sequenceBatches"],
    });
    updateParams({ action: null });
  };

  return (
    <Dialog
      open={params?.action === "edit"}
      onOpenChange={() => {
        form.reset({ name: sequence?.name }); // clear the form back to default values
        updateParams({ action: null }); // close the form
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit sequence</DialogTitle>
          <DialogDescription>Type a new name below</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sequence name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              rules={{ required: "Name is required" }}
            />
            <DialogFooter>
              <Button disabled={loading} type="submit">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
