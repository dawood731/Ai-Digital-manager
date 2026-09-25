import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";

export type DeliveryStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "FAILED";

export interface IOrder extends Document {
  businessId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  source: string;
  deliveryAddress?: string;
  city?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  variantName: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    orderNumber: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "NEW",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "NEW",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID", "REFUNDED"],
      default: "PENDING",
    },
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "FAILED"],
      default: "PENDING",
    },
    source: { type: String, default: "WHATSAPP" },
    deliveryAddress: { type: String },
    city: { type: String, default: "Lahore" },
    notes: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ businessId: 1, createdAt: -1 });
OrderSchema.index({ businessId: 1, status: 1 });
OrderSchema.index({ businessId: 1, paymentStatus: 1 });
OrderSchema.index({ businessId: 1, orderNumber: 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
