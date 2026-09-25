import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "BUSINESS_OWNER" | "ADMIN";
  businessIds: mongoose.Types.ObjectId[];
  defaultBusinessId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "BUSINESS_OWNER", "ADMIN"],
      default: "BUSINESS_OWNER",
    },
    businessIds: [{ type: Schema.Types.ObjectId, ref: "Business" }],
    defaultBusinessId: { type: Schema.Types.ObjectId, ref: "Business" },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
