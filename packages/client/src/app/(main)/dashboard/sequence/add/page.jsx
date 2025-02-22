import { AddSequenceForm } from "./components/add-sequence-form";

export default function Page() {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col gap-4 w-full items-center">
        <AddSequenceForm />
      </div>
    </div>
  );
}
