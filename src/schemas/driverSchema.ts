import { z } from "zod";

export const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  licenseNumber: z.string().min(1, "License number is required"),
});

export type DriverForm = z.infer<typeof driverSchema>;
