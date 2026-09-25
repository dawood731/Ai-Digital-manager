import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductVariant {
  name: string; // e.g. "Medium / Black", "Large / Blue"
  sku?: string;
  price?: number;
  stockQuantity: number;
}

export interface IProduct extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  category: string;
  description?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  variants: IProductVariant[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true },
  sku: { type: String },
  price: { type: Number },
  stockQuantity: { type: Number, required: true, default: 0 },
});

const ProductSchema = new Schema<IProduct>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    category: { type: String, required: true, default: "General" },
    description: { type: String },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    stockQuantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    images: [{ type: String }],
    variants: [ProductVariantSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ businessId: 1, name: "text", sku: "text" });
ProductSchema.index({ businessId: 1, category: 1 });
ProductSchema.index({ businessId: 1, stockQuantity: 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
