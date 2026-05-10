import { faqs } from "../data";
import type { FaqItem } from "../types";
import { SectionHeader } from "./SectionHeader";

function FaqCard({ item }: { item: FaqItem }) {
  return (
    <article className="rounded-md border border-black/10 bg-white p-5">
      <h3 className="text-lg font-black">{item.question}</h3>
      <p className="mt-2 leading-7 text-black/62">{item.answer}</p>
    </article>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="bg-[#f7f5ef] py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions about SMM services."
        />
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FaqCard key={faq.question} item={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
