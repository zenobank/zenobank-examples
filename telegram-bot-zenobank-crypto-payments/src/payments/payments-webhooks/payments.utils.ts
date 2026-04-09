import { Payment, PaymentStatus } from "@prisma/client";

export function isCheckoutCompleted(existingPayment: Pick<Payment, "status">) {
  return existingPayment.status === PaymentStatus.COMPLETED;
}
