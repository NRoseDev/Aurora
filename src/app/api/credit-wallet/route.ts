import { NextResponse } from 'next/server';

// Mock database execution for credit tracking based on the guidelines
export async function POST(req: Request) {
  try {
    const { userId, actionType, isConsecutiveDebugLoop } = await req.json();

    if (!userId || !actionType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // RULE 1: Baseline system defaults to 1,100 credits
    let userCredits = 1100; 
    let creditDeduction = 0;

    // Determine the cost of the operations
    if (actionType === 'VIDEO_TRANSLATION') {
      creditDeduction = 10;
    } else if (actionType === 'CODE_COMPILATION') {
      creditDeduction = 2;
    }

    // RULE 2: Smart Refund Engine (Zero-Penalty Debugging)
    // If an error happened previously and the AI is currently fixing it, cost is 0
    if (isConsecutiveDebugLoop) {
      creditDeduction = 0;
    }

    // Calculate final balance
    const updatedBalance = userCredits - creditDeduction;

    return NextResponse.json({
      success: true,
      action: actionType,
      deduction: creditDeduction,
      remainingCredits: updatedBalance,
      message: isConsecutiveDebugLoop 
        ? "Zero-penalty debugging loop active. 0 credits deducted." 
        : `Deducted ${creditDeduction} credits from baseline.`
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
