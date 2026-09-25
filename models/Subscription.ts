import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscription extends Document {
  businessId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  usage: {
    customersCount: number;
    productsCount: number;
    ordersThisMonth: number;
    aiRequestsThisMonth: number;
    automationsCount: number;
    lastResetAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    status: {
      type: String,
      enum: ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"],
      default: "TRIALING",
    },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date },
    trialEndsAt: { type: Date },
    usage: {
      customersCount: { type: Number, default: 0 },
      productsCount: { type: Number, default: 0 },
      ordersThisMonth: { type: Number, default: 0 },
      aiRequestsThisMonth: { type: Number, default: 0 },
      automationsCount: { type: Number, default: 0 },
      lastResetAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
