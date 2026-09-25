import mongoose, { Schema, Document, Model } from "mongoose";

export type AutomationTrigger =
  | "ORDER_DELIVERED"
  | "PAYMENT_PENDING"
  | "STOCK_LOW"
  | "INQUIRY_RECEIVED"
  | "CUSTOMER_INACTIVE";

export interface IAutomationAction {
  type: "CREATE_FOLLOWUP" | "GENERATE_AI_REPLY" | "SEND_NOTIFICATION" | "TAG_CUSTOMER";
  params: Record<string, any>;
}

export interface IAutomation extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: Record<string, any>;
  actions: IAutomationAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationSchema = new Schema<IAutomation>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    trigger: {
      type: String,
      enum: [
        "ORDER_DELIVERED",
        "PAYMENT_PENDING",
        "STOCK_LOW",
        "INQUIRY_RECEIVED",
        "CUSTOMER_INACTIVE",
      ],
      required: true,
    },
    conditions: { type: Schema.Types.Mixed, default: {} },
    actions: [
      {
        type: { type: String, required: true },
        params: { type: Schema.Types.Mixed, default: {} },
      },
    ],
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AutomationSchema.index({ businessId: 1, trigger: 1, enabled: 1 });

export const Automation: Model<IAutomation> =
  mongoose.models.Automation || mongoose.model<IAutomation>("Automation", AutomationSchema);
