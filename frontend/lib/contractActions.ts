import { openContractCall } from '@stacks/connect';
import { STACKS_MAINNET } from '@stacks/network';
import { principalCV, uintCV, stringAsciiCV, bufferCV } from '@stacks/transactions';

const CONTRACT_ADDRESS = 'SP34HE2KF7SPKB8BD5GY39SG7M207FZPRXJS4NMY9';
const CONTRACT_NAME = 'bittask';

export async function createTask(
  title: string,
  description: string,
  amount: number,
  deadline: number
) {
  try {
    await openContractCall({
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'create-task',
      functionArgs: [
        stringAsciiCV(title),
        stringAsciiCV(description),
        uintCV(amount),
        uintCV(deadline),
      ],
      network: STACKS_MAINNET,
      onFinish: (data) => {
        console.log('Task created:', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    });
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function acceptTask(taskId: number) {
  try {
    await openContractCall({
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'accept-task',
      functionArgs: [uintCV(taskId)],
      network: STACKS_MAINNET,
      onFinish: (data) => {
        console.log('Task accepted:', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    });
  } catch (error) {
    console.error('Error accepting task:', error);
    throw error;
  }
}

export async function submitWork(taskId: number, proofHash: string) {
  try {
    // Convert hex string to buffer
    const proofBuffer = Buffer.from(proofHash, 'hex');

    await openContractCall({
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'submit-work',
      functionArgs: [uintCV(taskId), bufferCV(proofBuffer)],
      network: STACKS_MAINNET,
      onFinish: (data) => {
        console.log('Work submitted:', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    });
  } catch (error) {
    console.error('Error submitting work:', error);
    throw error;
  }
}

export async function approveWork(taskId: number) {
  try {
    await openContractCall({
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'approve-work',
      functionArgs: [uintCV(taskId)],
      network: STACKS_MAINNET,
      onFinish: (data) => {
        console.log('Work approved:', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    });
  } catch (error) {
    console.error('Error approving work:', error);
    throw error;
  }
}
