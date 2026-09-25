import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string; // Free Trial, Starter, Growth, Business
  slug: string;
  pricePKR: number;
  interval: "monthly" | "yearly" | "trial";
  trialDays: number;
  limits: {
    maxCustomers: number;
    maxProducts: number;
    maxOrdersPerMonth: number;
    maxAiRequestsPerMonth: number;
    maxAutomations: number;
  };
  features: string[];
  isActive: boolean;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    pricePKR: { type: Number, required: true, default: 0 },
    interval: { type: String, enum: ["monthly", "yearly", "trial"], default: "monthly" },
    trialDays: { type: Number, default: 7 },
    limits: {
      maxCustomers: { type: Number, default: 50 },
      maxProducts: { type: Number, default: 20 },
      maxOrdersPerMonth: { type: Number, default: 50 },
      maxAiRequestsPerMonth: { type: Number, default: 100 },
      maxAutomations: { type: Number, default: 2 },
    },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SubscriptionPlan: Model<ISubscriptionPlan> =
  mongoose.models.SubscriptionPlan ||
  mongoose.model<ISubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema);
