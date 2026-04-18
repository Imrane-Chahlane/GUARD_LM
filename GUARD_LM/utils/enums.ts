import {
  ActionTaken,
  MaliciousAction,
  PromptStatus,
  SubscriptionStatus
} from "@prisma/client";
import type {
  ActionTakenName,
  MaliciousActionName,
  PromptFinalStatus
} from "@/types/analysis";

export function maliciousActionToApi(action: MaliciousAction): MaliciousActionName {
  switch (action) {
    case MaliciousAction.SANITIZE:
      return "sanitize";
    case MaliciousAction.REJECT_WITH_REASON:
      return "reject_with_reason";
    case MaliciousAction.REJECT:
    default:
      return "reject";
  }
}

export function maliciousActionToPrisma(action: MaliciousActionName): MaliciousAction {
  switch (action) {
    case "sanitize":
      return MaliciousAction.SANITIZE;
    case "reject_with_reason":
      return MaliciousAction.REJECT_WITH_REASON;
    case "reject":
    default:
      return MaliciousAction.REJECT;
  }
}

export function promptStatusToPrisma(status: PromptFinalStatus): PromptStatus {
  switch (status) {
    case "sanitized":
      return PromptStatus.SANITIZED;
    case "malicious":
      return PromptStatus.MALICIOUS;
    case "safe":
    default:
      return PromptStatus.SAFE;
  }
}

export function promptStatusToApi(status: PromptStatus): PromptFinalStatus {
  switch (status) {
    case PromptStatus.SANITIZED:
      return "sanitized";
    case PromptStatus.MALICIOUS:
      return "malicious";
    case PromptStatus.SAFE:
    default:
      return "safe";
  }
}

export function actionTakenToPrisma(action: ActionTakenName): ActionTaken {
  switch (action) {
    case "reject":
      return ActionTaken.REJECT;
    case "sanitize":
      return ActionTaken.SANITIZE;
    case "reject_with_reason":
      return ActionTaken.REJECT_WITH_REASON;
    case "forward":
    default:
      return ActionTaken.FORWARD;
  }
}

export function actionTakenToApi(action: ActionTaken): ActionTakenName {
  switch (action) {
    case ActionTaken.REJECT:
      return "reject";
    case ActionTaken.SANITIZE:
      return "sanitize";
    case ActionTaken.REJECT_WITH_REASON:
      return "reject_with_reason";
    case ActionTaken.FORWARD:
    default:
      return "forward";
  }
}

export function subscriptionStatusToLabel(status: SubscriptionStatus) {
  return status.toLowerCase().replace("_", " ");
}
