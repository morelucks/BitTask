
import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe('approve-work', () => {
    it('should approve work and transfer funds', () => {
        const deadline = simnet.blockHeight + 50;

        // Create task
        simnet.callPublicFn('bittask', 'create-task', [
            Cl.stringAscii("Task"), Cl.stringAscii("Desc"), Cl.uint(1000), Cl.uint(deadline)
        ], wallet1);

        // Accept task
        simnet.callPublicFn('bittask', 'accept-task', [Cl.uint(1)], wallet2);

        // Submit work
        simnet.callPublicFn('bittask', 'submit-work', [Cl.uint(1), Cl.stringAscii("link")], wallet2);

        // Approve work (creator)
        const { result } = simnet.callPublicFn(
            'bittask',
            'approve-work',
            [Cl.uint(1)],
            wallet1
        );

        expect(result).toBeOk(Cl.bool(true));

        // Verify status
        const task = simnet.callReadOnlyFn('bittask', 'get-task', [Cl.uint(1)], deployer);
        expect(task.result).toBeSome(expect.objectContaining({
            status: Cl.stringAscii("completed")
        }));
    });

    it('should fail if work is not submitted', () => {
        const deadline = simnet.blockHeight + 50;
        simnet.callPublicFn('bittask', 'create-task', [
            Cl.stringAscii("Task"), Cl.stringAscii("Desc"), Cl.uint(1000), Cl.uint(deadline)
        ], wallet1);

        simnet.callPublicFn('bittask', 'accept-task', [Cl.uint(1)], wallet2);

        // Try approve without submission
        const { result } = simnet.callPublicFn(
            'bittask',
            'approve-work',
            [Cl.uint(1)],
            wallet1
        );

        expect(result).toBeErr(Cl.uint(110)); // ERR-NOT-SUBMITTED
    });

    it('should fail if caller is not the creator', () => {
        const deadline = simnet.blockHeight + 50;
        simnet.callPublicFn('bittask', 'create-task', [
            Cl.stringAscii("Task"), Cl.stringAscii("Desc"), Cl.uint(1000), Cl.uint(deadline)
        ], wallet1);

        simnet.callPublicFn('bittask', 'accept-task', [Cl.uint(1)], wallet2);
        simnet.callPublicFn('bittask', 'submit-work', [Cl.uint(1), Cl.stringAscii("link")], wallet2);

        // Try approve with wallet2 (worker)
        const { result } = simnet.callPublicFn(
            'bittask',
            'approve-work',
            [Cl.uint(1)],
            wallet2
        );

        expect(result).toBeErr(Cl.uint(111)); // ERR-NOT-CREATOR
    });
});
