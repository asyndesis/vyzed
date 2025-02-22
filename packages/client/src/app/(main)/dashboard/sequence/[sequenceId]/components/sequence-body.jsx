import { SequenceBodySomicHypermutation } from "./sequence-body-somic-hypermutation";
import { SequenceBodyGeneUsage } from "./sequence-body-gene-usage";
import { SequenceBodyFullLength } from "./sequence-body-full-length";

export function SequenceBody() {
  return (
    <>
      <h1 className="scroll-m-20 text-lg font-semibold tracking-tight">
        Antibody Identification
      </h1>
      <div className="flex w-full gap-4">
        <div className="flex flex-1 flex-col gap-4">
          <SequenceBodyGeneUsage />
          <SequenceBodySomicHypermutation />
          <SequenceBodyFullLength />
        </div>
        <div className="flex flex-1 flex-col gap-4">TODO</div>
      </div>
    </>
  );
}
