import { openContractCall } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { uintCV, stringAsciiCV, createAssetInfo, createSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

const CONTRACT_ADDRESS = 'SP34HE2KF7SPKB8BD5GY39SG7M207FZPRXJS4NMY9';
const CONTRACT_NAME = 'bittask';

// Use testnet for development, mainnet for production
const network = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

export interface ContractCallOptions {
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

export async function createTask(
  title: string,
  description: string,
  amount: number, // in micro-STX (1 STX = 1,000,000 micro-STX)
  deadline: number, // block height
  options?: ContractCallOptions
): Promise<void> {
  try {
    // Convert STX to micro-STX if needed (assuming amount is in STX)
    const amountMicroSTX = amount < 1000000 ? amount * 1000000 : amount;
    
    // Create post-condition to ensure only the specified amount is transferred
    const postConditions = [
      createSTXPostCondition(
        'tx-sender',
        FungibleConditionCode.Equal,
        amountMicroSTX
      ),
    ];

    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-task',
      functionArgs: [
        stringAsciiCV(title),
        stringAsciiCV(description),
        uintCV(amountMicroSTX),
        uintCV(deadline),
      ],
      network,
      postConditions,
      onFinish: (data) => {
        console.log('Task created:', data);
        options?.onFinish?.(data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        options?.onCancel?.();
      },
    });
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function acceptTask(
  taskId: number,
  options?: ContractCallOptions
): Promise<void> {
  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'accept-task',
      functionArgs: [uintCV(taskId)],
      network,
      onFinish: (data) => {
        console.log('Task accepted:', data);
        options?.onFinish?.(data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        options?.onCancel?.();
      },
    });
  } catch (error) {
    console.error('Error accepting task:', error);
    throw error;
  }
}

export async function submitWork(
  taskId: number,
  submission: string, // Link or hash of the work (string-ascii 256)
  options?: ContractCallOptions
): Promise<void> {
  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'submit-work',
      functionArgs: [
        uintCV(taskId),
        stringAsciiCV(submission),
      ],
      network,
      onFinish: (data) => {
        console.log('Work submitted:', data);
        options?.onFinish?.(data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        options?.onCancel?.();
      },
    });
  } catch (error) {
    console.error('Error submitting work:', error);
    throw error;
  }
}

export async function approveWork(
  taskId: number,
  options?: ContractCallOptions
): Promise<void> {
  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'approve-work',
      functionArgs: [uintCV(taskId)],
      network,
      onFinish: (data) => {
        console.log('Work approved:', data);
        options?.onFinish?.(data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
        options?.onCancel?.();
      },
    });
  } catch (error) {
    console.error('Error approving work:', error);
    throw error;
  }
}
