import { Task } from './contracts';

// Stacks blocks are approximately 10 minutes apart
const BLOCKS_PER_MINUTE = 0.1;
const MINUTES_PER_BLOCK = 10;

/**
 * Fetch current Stacks block height from API
 */
export async function getCurrentBlockHeight(): Promise<number> {
  try {
    const network = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' 
      ? 'https://api.stacks.co' 
      : 'https://api.testnet.stacks.co';
    const response = await fetch(`${network}/v2/info`);
    const info = await response.json();
    return info.stacks_tip_height || 0;
  } catch (e) {
    console.error('Failed to fetch current block height', e);
    // Fallback approximation
    return 100000;
  }
}

/**
 * Check if a task has expired based on deadline block height
 */
export async function isTaskExpired(task: Task): Promise<boolean> {
  if (!task.deadline) return false;
  
  const currentHeight = await getCurrentBlockHeight();
  return currentHeight >= task.deadline;
}

/**
 * Calculate approximate time until deadline
 */
export function getTimeUntilDeadline(deadlineBlockHeight: number, currentBlockHeight: number): {
  expired: boolean;
  days?: number;
  hours?: number;
  minutes?: number;
} {
  const blocksRemaining = deadlineBlockHeight - currentBlockHeight;
  
  if (blocksRemaining <= 0) {
    return { expired: true };
  }
  
  const minutesRemaining = blocksRemaining * MINUTES_PER_BLOCK;
  const hoursRemaining = Math.floor(minutesRemaining / 60);
  const daysRemaining = Math.floor(hoursRemaining / 24);
  
  return {
    expired: false,
    days: daysRemaining > 0 ? daysRemaining : undefined,
    hours: hoursRemaining > 0 ? hoursRemaining % 24 : undefined,
    minutes: Math.floor(minutesRemaining % 60),
  };
}

/**
 * Format deadline for display
 */
export function formatDeadline(deadlineBlockHeight: number, currentBlockHeight: number): string {
  const timeInfo = getTimeUntilDeadline(deadlineBlockHeight, currentBlockHeight);
  
  if (timeInfo.expired) {
    return 'Expired';
  }
  
  const parts: string[] = [];
  if (timeInfo.days) parts.push(`${timeInfo.days}d`);
  if (timeInfo.hours) parts.push(`${timeInfo.hours}h`);
  if (timeInfo.minutes !== undefined) parts.push(`${timeInfo.minutes}m`);
  
  return parts.length > 0 ? parts.join(' ') : 'Soon';
}


