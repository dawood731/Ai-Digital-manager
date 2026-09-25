import { Automation, AutomationTrigger } from "@/models/Automation";
import { AutomationExecution } from "@/models/AutomationExecution";
import { FollowUp } from "@/models/FollowUp";
import { Notification } from "@/models/Notification";
import { Inquiry } from "@/models/Inquiry";
import { AIService } from "./aiService";
import { Business } from "@/models/Business";
import mongoose from "mongoose";

export class AutomationEngine {
  /**
   * Fires automations for a given business when a business event occurs.
   */
  static async triggerEvent(
    businessId: mongoose.Types.ObjectId,
    trigger: AutomationTrigger,
    payload: Record<string, any>
  ): Promise<void> {
    try {
      const automations = await Automation.find({
        businessId,
        trigger,
        enabled: true,
      });

      if (!automations || automations.length === 0) return;

      const business = await Business.findById(businessId);
      if (!business) return;

      const aiMode = business.aiSettings?.mode || "APPROVAL";
      const permissions = business.aiSettings?.permissions;

      for (const auto of automations) {
        try {
          let executionStatus: "SUCCESS" | "FAILED" | "PENDING_APPROVAL" | "SKIPPED" = "SUCCESS";
          let executionDetails = "";

          for (const action of auto.actions) {
            switch (action.type) {
              case "CREATE_FOLLOWUP": {
                const customerId = payload.customerId || payload.customer?._id;
                if (!customerId) break;

                const daysDelay = action.params?.delayDays || 2;
                const dueAt = new Date();
                dueAt.setDate(dueAt.getDate() + daysDelay);

                const message =
                  action.params?.template ||
                  `Hi ${payload.customerName || "there"}, thank you for your order! How was your experience with ${business.name}?`;

                await FollowUp.create({
                  businessId,
                  customerId,
                  orderId: payload.orderId,
                  type: action.params?.followUpType || "POST_DELIVERY",
                  reason: action.params?.reason || `Automated: ${auto.name}`,
                  message,
                  dueAt,
                  status: "PENDING",
                  channel: "WHATSAPP",
                  isAiGenerated: true,
                });

                executionDetails += `Created follow-up due in ${daysDelay} days. `;
                break;
              }

              case "SEND_NOTIFICATION": {
                await Notification.create({
                  businessId,
                  title: action.params?.title || `Automation: ${auto.name}`,
                  message:
                    action.params?.message ||
                    `Event triggered: ${trigger} on ${payload.itemName || "item"}`,
                  type: action.params?.level || "INFO",
                  link: action.params?.link || "/dashboard",
                });
                executionDetails += `Notification sent. `;
                break;
              }

              case "GENERATE_AI_REPLY": {
                if (trigger === "INQUIRY_RECEIVED" && payload.inquiryId) {
                  const inquiry = await Inquiry.findById(payload.inquiryId);
                  if (inquiry && !inquiry.aiSuggestedReply) {
                    const businessContext = {
                      businessName: business.name,
                      category: business.category,
                      city: business.city,
                      currency: business.currency,
                      deliveryFee: business.settings?.deliveryFee || 250,
                      freeDeliveryThreshold: business.settings?.freeDeliveryThreshold || 3000,
                      deliveryTimes: business.settings?.cityDeliveryTime || "1-2 days",
                    };

                    const { reply } = await AIService.generateCustomerReply(
                      businessId,
                      businessContext,
                      inquiry.message,
                      inquiry.productId?.toString()
                    );

                    inquiry.aiSuggestedReply = reply;
                    await inquiry.save();
                    executionDetails += `Generated AI reply suggestion for inquiry. `;
                  }
                }
                break;
              }

              default:
                executionDetails += `Action ${action.type} handled. `;
            }
          }

          await AutomationExecution.create({
            businessId,
            automationId: auto._id,
            trigger,
            status: executionStatus,
            details: executionDetails || "Completed successfully.",
            executedAt: new Date(),
          });
        } catch (err: any) {
          console.error(`[Automation Engine] Error executing automation ${auto._id}:`, err);
          await AutomationExecution.create({
            businessId,
            automationId: auto._id,
            trigger,
            status: "FAILED",
            details: err.message || "Execution error",
            executedAt: new Date(),
          });
        }
      }
    } catch (globalErr) {
      console.error("[Automation Engine] Global error:", globalErr);
    }
  }
}
