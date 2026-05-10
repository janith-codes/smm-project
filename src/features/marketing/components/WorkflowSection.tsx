import { workflowSteps } from "../data";
import type { WorkflowStep } from "../types";
import { SectionHeader } from "./SectionHeader";

function WorkflowStepCard({
  step,
  stepNumber,
}: {
  step: WorkflowStep;
  stepNumber: number;
}) {
  return (
    <article className="rounded-md border border-black/10 bg-[#faf8f2] p-5">
      <p className="text-4xl font-black text-[#2f80ed]">
        {String(stepNumber).padStart(2, "0")}
      </p>
      <p className="mt-5 text-base font-semibold leading-7 text-black/72">
        {step.description}
      </p>
    </article>
  );
}

export function WorkflowSection() {
  return (
    <section id="workflow" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="Order social media services in a few simple steps."
          eyebrowClassName="text-[#ff6b35]"
          titleClassName="max-w-3xl"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <WorkflowStepCard
              key={step.description}
              step={step}
              stepNumber={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
