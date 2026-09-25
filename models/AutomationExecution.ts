import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAutomationExecution extends Document {
  businessId: mongoose.Types.ObjectId;
  automationId: mongoose.Types.ObjectId;
  trigger: string;
  status: "SUCCESS" | "FAILED" | "PENDING_APPROVAL" | "SKIPPED";
  details: string;
  executedAt: Date;
}

const AutomationExecutionSchema = new Schema<IAutomationExecution>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    automationId: { type: Schema.Types.ObjectId, ref: "Automation", required: true },
    trigger: { type: String, required: true },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING_APPROVAL", "SKIPPED"],
      default: "SUCCESS",
    },
    details: { type: String },
    executedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AutomationExecutionSchema.index({ businessId: 1, executedAt: -1 });

export const AutomationExecution: Model<IAutomationExecution> =
  mongoose.models.AutomationExecution ||
  mongoose.model<IAutomationExecution>("AutomationExecution", AutomationExecutionSchema);
