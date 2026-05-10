import { Suspense } from "react";
import { NewOrderPage } from "@/features/order/components/NewOrderPage";

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-[#f0f4fa] text-slate-500">
          Loading…
        </div>
      }
    >
      <NewOrderPage />
    </Suspense>
  );
}
