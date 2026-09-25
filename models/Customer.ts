import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  tags: string[];
  source: "WHATSAPP" | "INSTAGRAM" | "FACEBOOK" | "WEBSITE" | "DIRECT" | "OTHER";
  totalOrders: number;
  totalSpent: number;
  lastInteractionAt: Date;
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, default: "Lahore" },
    notes: { type: String },
    tags: [{ type: String }],
    source: {
      type: String,
      enum: ["WHATSAPP", "INSTAGRAM", "FACEBOOK", "WEBSITE", "DIRECT", "OTHER"],
      default: "WHATSAPP",
    },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastInteractionAt: { type: Date, default: Date.now },
    aiSummary: { type: String },
  },
  { timestamps: true }
);

CustomerSchema.index({ businessId: 1, phone: 1 });
CustomerSchema.index({ businessId: 1, name: "text" });

export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
