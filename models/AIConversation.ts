import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  proposedAction?: {
    type: "CREATE_CUSTOMER" | "CREATE_DRAFT_ORDER" | "CREATE_FOLLOWUP" | "UPDATE_ORDER_STATUS" | "SEND_WHATSAPP";
    payload: any;
    status: "PROPOSED" | "APPROVED" | "REJECTED" | "EXECUTED";
  };
  createdAt: Date;
}

export interface IAIConversation extends Document {
  businessId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IAIMessage[];
  mode: "ASSISTANT" | "APPROVAL" | "AUTONOMOUS";
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  proposedAction: {
    type: { type: String },
    payload: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["PROPOSED", "APPROVED", "REJECTED", "EXECUTED"],
      default: "PROPOSED",
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const AIConversationSchema = new Schema<IAIConversation>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "New Conversation" },
    messages: [AIMessageSchema],
    mode: { type: String, default: "APPROVAL" },
  },
  { timestamps: true }
);

AIConversationSchema.index({ businessId: 1, updatedAt: -1 });

export const AIConversation: Model<IAIConversation> =
  mongoose.models.AIConversation ||
  mongoose.model<IAIConversation>("AIConversation", AIConversationSchema);
