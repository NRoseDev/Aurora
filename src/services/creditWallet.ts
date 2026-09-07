export interface CreditWalletRequest {
  userId: string;
  actionType: string;
  isConsecutiveDebugLoop?: boolean;
}

export interface CreditWalletResponse {
  success: boolean;
  action: string;
  deduction: number;
  remainingCredits: number;
  message: string;
}

export function processCreditWallet({
  userId,
  actionType,
  isConsecutiveDebugLoop = false,
}: CreditWalletRequest): CreditWalletResponse {
  if (!userId || !actionType) {
    throw new Error('Missing parameters');
  }

  let userCredits = 1100;
  let creditDeduction = 0;

  if (actionType === 'VIDEO_TRANSLATION') {
    creditDeduction = 10;
  } else if (actionType === 'CODE_COMPILATION') {
    creditDeduction = 2;
  }

  if (isConsecutiveDebugLoop) {
    creditDeduction = 0;
  }

  const updatedBalance = userCredits - creditDeduction;

  return {
    success: true,
    action: actionType,
    deduction: creditDeduction,
    remainingCredits: updatedBalance,
    message: isConsecutiveDebugLoop
      ? 'Zero-penalty debugging loop active. 0 credits deducted.'
      : `Deducted ${creditDeduction} credits from baseline.`,
  };
}
