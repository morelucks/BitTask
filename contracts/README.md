# BitTask Smart Contracts

This directory contains the Clarity smart contracts for the BitTask platform.

## Contracts

- `bittask.clar`: The main marketplace contract handling task creation, acceptance, submission, and approvals.

## Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet)
- [Node.js](https://nodejs.org/) (for running tests)

## Testing

We use Vitest for testing to ensure better integration with our TypeScript frontend tooling.

### Running Tests

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run all tests:
    ```bash
    npm test
    ```

3.  Run specific test file:
    ```bash
    npm test tests/accept-task.test.ts
    ```

### Test Coverage

The tests cover the following scenarios:
- **Task Creation**: Verifying funds locking and data storage.
- **Task Acceptance**: Worker assignment and status updates.
- **Work Submission**: Storing submission details.
- **Approval & Payout**: Releasing funds to the worker.
- **Edge Cases**: Invalid IDs, unauthorized actions, expiration handling.

## Deployment

To deploy to Testnet:

```bash
clarinet deploy --config Clarinet.toml --settings settings/Testnet.toml
```

Ensure you have your private key configured in the settings file.
