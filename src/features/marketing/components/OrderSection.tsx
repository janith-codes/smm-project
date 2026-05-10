import Link from "next/link";
import { orderServiceOptions, paymentMethodOptions } from "../data";
import type { OrderOption } from "../types";
import { SectionHeader } from "./SectionHeader";

function SelectField({
  label,
  options,
}: {
  label: string;
  options: OrderOption[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-black/68">{label}</span>
      <select className="mt-2 h-12 w-full rounded-md border border-black/12 bg-[#faf8f2] px-3 text-sm outline-none focus:border-[#ff6b35]">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  type = "text",
  defaultValue,
  placeholder,
  className = "",
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-bold text-black/68">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-md border border-black/12 bg-[#faf8f2] px-3 text-sm outline-none focus:border-[#ff6b35]"
      />
    </label>
  );
}

function OrderForm() {
  return (
    <form className="rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Service" options={orderServiceOptions} />
        <TextField label="Quantity" defaultValue="1000" />
        <TextField
          label="Public content link"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          className="sm:col-span-2"
        />
        <SelectField label="Payment method" options={paymentMethodOptions} />
        <TextField
          label="Contact number"
          type="tel"
          placeholder="+94 77 000 0000"
        />
      </div>
      <button
        type="button"
        className="mt-5 h-12 w-full rounded-md bg-[#ff6b35] text-base font-black text-white transition hover:bg-[#e85d2e]"
      >
        Submit order
      </button>
      <p className="mt-4 text-sm leading-6 text-black/55">
        For best results, make sure your profile, page, video, or post is public
        before submitting the order.
      </p>
    </form>
  );
}

export function OrderSection() {
  return (
    <section id="order" className="bg-[#f7f5ef] py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeader
          eyebrow="Place your order"
          title="Fast ordering for views, followers, likes, and subscribers."
          description="Use the full order page to browse every live service, filter by platform, and get an instant price estimate. You can still use the quick form here for a simple request."
          eyebrowClassName="text-[#00a676]"
        />
        <div className="space-y-4">
          <Link
            href="/order"
            className="flex h-14 w-full items-center justify-center rounded-md bg-gray-900 text-base font-black text-white transition hover:bg-[#ff6b35]"
          >
            Open full order page
          </Link>
          <OrderForm />
        </div>
      </div>
    </section>
  );
}
