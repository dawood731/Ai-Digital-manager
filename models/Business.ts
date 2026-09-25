import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAiPermissions {
  draftFollowUps: boolean;
  createCustomers: boolean;
  createDraftOrders: boolean;
  updateOrderStatus: boolean;
  sendAutomatedFollowups: boolean;
  answerCustomerQuestions: boolean;
  sendPaymentReminders: boolean;
}

export interface IBusinessSettings {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  cityDeliveryTime: string;
  nationalDeliveryTime: string;
  defaultDeliveryCompany: string;
}

export interface IBusiness extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  phone: string;
  email?: string;
  address?: string;
  city: string;
  country: string;
  currency: string;
  timezone: string;
  logo?: string;
  settings: IBusinessSettings;
  aiSettings: {
    mode: "ASSISTANT" | "APPROVAL" | "AUTONOMOUS";
    permissions: IAiPermissions;
  };
  subscriptionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: "Clothing & Fashion" },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, default: "Lahore" },
    country: { type: String, default: "Pakistan" },
    currency: { type: String, default: "PKR" },
    timezone: { type: String, default: "Asia/Karachi" },
    logo: { type: String },
    settings: {
      deliveryFee: { type: Number, default: 250 },
      freeDeliveryThreshold: { type: Number, default: 3000 },
      cityDeliveryTime: { type: String, default: "1-2 Business Days" },
      nationalDeliveryTime: { type: String, default: "3-5 Business Days" },
      defaultDeliveryCompany: { type: String, default: "Trax / CallCourier / Leopard" },
    },
    aiSettings: {
      mode: {
        type: String,
        enum: ["ASSISTANT", "APPROVAL", "AUTONOMOUS"],
        default: "APPROVAL",
      },
      permissions: {
        draftFollowUps: { type: Boolean, default: true },
        createCustomers: { type: Boolean, default: true },
        createDraftOrders: { type: Boolean, default: true },
        updateOrderStatus: { type: Boolean, default: false },
        sendAutomatedFollowups: { type: Boolean, default: false },
        answerCustomerQuestions: { type: Boolean, default: true },
        sendPaymentReminders: { type: Boolean, default: false },
      },
    },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },
  },
  { timestamps: true }
);

export const Business: Model<IBusiness> =
  mongoose.models.Business || mongoose.model<IBusiness>("Business", BusinessSchema);
