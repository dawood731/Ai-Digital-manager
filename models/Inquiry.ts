import mongoose, { Schema, Document, Model } from "mongoose";

export type InquiryStatus = "NEW" | "OPEN" | "WAITING" | "RESPONDED" | "CONVERTED" | "CLOSED";
export type InquiryChannel = "WHATSAPP" | "INSTAGRAM" | "FACEBOOK" | "DIRECT" | "OTHER";

export interface IInquiry extends Document {
  businessId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  message: string;
  channel: InquiryChannel;
  productId?: mongoose.Types.ObjectId;
  status: InquiryStatus;
  aiSuggestedReply?: string;
  assignedOwner?: string;
  convertedOrderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    channel: {
      type: String,
      enum: ["WHATSAPP", "INSTAGRAM", "FACEBOOK", "DIRECT", "OTHER"],
      default: "WHATSAPP",
    },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    status: {
      type: String,
      enum: ["NEW", "OPEN", "WAITING", "RESPONDED", "CONVERTED", "CLOSED"],
      default: "NEW",
    },
    aiSuggestedReply: { type: String },
    assignedOwner: { type: String },
    convertedOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

InquirySchema.index({ businessId: 1, status: 1 });
InquirySchema.index({ businessId: 1, createdAt: -1 });

export const Inquiry: Model<IInquiry> =
  mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);
