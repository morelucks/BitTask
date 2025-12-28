import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const alice = accounts.get('wallet_1')!;
const bob = accounts.get('wallet_2')!;
describe('BitToken Contract', () => {
  it('should have correct token metadata', () => {
    const name = simnet.callReadOnlyFn('token', 'get-name', [], deployer);
    const symbol = simnet.callReadOnlyFn('token', 'get-symbol', [], deployer);
    const decimals = simnet.callReadOnlyFn('token', 'get-decimals', [], deployer);
    
    expect(name.result).toBeOk(Cl.stringAscii('BitToken'));
    expect(symbol.result).toBeOk(Cl.stringAscii('BTK'));
    expect(decimals.result).toBeOk(Cl.uint(6));
  });
});