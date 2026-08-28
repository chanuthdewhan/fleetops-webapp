import { z } from "zod";

export const orderSchema = z.object({
  customerId: z.coerce.number().min(1, "Select a customer"),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  weightKg: z.coerce.number().positive("Must be a positive number"),
});
export type OrderFormInput = z.input<typeof orderSchema>;
export type OrderForm = z.output<typeof orderSchema>;
