import mongoose, { Schema, Document, Model } from "mongoose";

export type FollowUpStatus = "PENDING" | "SENT" | "COMPLETED" | "SKIPPED" | "FAILED";
export type FollowUpType =
  | "POST_DELIVERY"
  | "PENDING_PAYMENT"
  | "ABANDONED_INQUIRY"
  | "RE_ENGAGEMENT"
  | "CUSTOM";

export interface IFollowUp extends Document {
  businessId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  inquiryId?: mongoose.Types.ObjectId;
  type: FollowUpType;
  reason: string;
  message: string;
  dueAt: Date;
  status: FollowUpStatus;
  channel: string;
  isAiGenerated: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    inquiryId: { type: Schema.Types.ObjectId, ref: "Inquiry" },
    type: {
      type: String,
      enum: ["POST_DELIVERY", "PENDING_PAYMENT", "ABANDONED_INQUIRY", "RE_ENGAGEMENT", "CUSTOM"],
      default: "CUSTOM",
    },
    reason: { type: String, required: true },
    message: { type: String, required: true },
    dueAt: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "COMPLETED", "SKIPPED", "FAILED"],
      default: "PENDING",
    },
    channel: { type: String, default: "WHATSAPP" },
    isAiGenerated: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

FollowUpSchema.index({ businessId: 1, dueAt: 1, status: 1 });

export const FollowUp: Model<IFollowUp> =
  mongoose.models.FollowUp || mongoose.model<IFollowUp>("FollowUp", FollowUpSchema);
