# NexWallet for Stellar/Soroban

A modular smart contract wallet implementation for the Stellar/Soroban blockchain, with integrated support for Soroswap DEX.

## Overview

NexWallet is a multi-purpose wallet implementation for Soroban that provides:

- **Plugin Architecture**: Extendable plugin system similar to Ethereum's modular wallet design
- **Soroswap Integration**: Native support for Soroswap DEX (swap, add liquidity, remove liquidity)
- **Multi-signature**: Support for transaction authorization using multiple signers
- **Factory Pattern**: Easy wallet deployment via factory contracts

## Contracts Structure

- **Wallet**: The main wallet contract that manages assets and executes operations
- **WalletFactory**: Deploys and keeps track of wallet instances
- **SoroswapPlugin**: Plugin for interacting with Soroswap DEX

## How to Use

### 1. Deploy the Contracts

First, deploy the wallet factory contract:

```bash
soroban contract deploy \
  --wasm path/to/wallet_factory.wasm \
  --source ADMIN_ACCOUNT \
  --network [standalone|testnet|mainnet]
```

Then prepare the wallet WASM hash:

```bash
soroban contract install \
  --wasm path/to/wallet.wasm \
  --source ADMIN_ACCOUNT \
  --network [standalone|testnet|mainnet]
```

Finally, deploy and initialize the Soroswap plugin:

```bash
soroban contract deploy \
  --wasm path/to/soroswap_plugin.wasm \
  --source ADMIN_ACCOUNT \
  --network [standalone|testnet|mainnet]

soroban contract invoke \
  --id SOROSWAP_PLUGIN_ID \
  --source ADMIN_ACCOUNT \
  --network [standalone|testnet|mainnet] \
  -- initialize \
  --router SOROSWAP_ROUTER_ADDRESS \
  --factory SOROSWAP_FACTORY_ADDRESS \
  --owner WALLET_FACTORY_ID
```

### 2. Initialize the Factory

Initialize the wallet factory with the wallet WASM hash:

```bash
soroban contract invoke \
  --id WALLET_FACTORY_ID \
  --source ADMIN_ACCOUNT \
  --network [standalone|testnet|mainnet] \
  -- initialize \
  --admin ADMIN_ACCOUNT \
  --wallet_wasm WALLET_WASM_HASH
```

### 3. Register the Soroswap Plugin

Register the Soroswap plugin with the factory:

```bash
soroban contract invoke \
  --id WALLET_FACTORY_ID \
  --source ADMIN_ACCOUNT \
  --network [standalone|testnet|mainnet] \
  -- register_plugin \
  --plugin SOROSWAP_PLUGIN_ID
```

### 4. Create a Wallet

Create a wallet for a user:

```bash
soroban contract invoke \
  --id WALLET_FACTORY_ID \
  --source ADMIN_ACCOUNT \
  --network [standalone|testnet|mainnet] \
  -- create_wallet \
  --owner USER_ADDRESS
```

### 5. Authorize the Soroswap Plugin

The user needs to authorize the Soroswap plugin in their wallet:

```bash
soroban contract invoke \
  --id USER_WALLET_ID \
  --source USER_ADDRESS \
  --network [standalone|testnet|mainnet] \
  -- authorize_plugin \
  --plugin SOROSWAP_PLUGIN_ID
```

### 6. Perform Swaps via Soroswap

Now the user can perform swaps via Soroswap:

```bash
soroban contract invoke \
  --id USER_WALLET_ID \
  --source USER_ADDRESS \
  --network [standalone|testnet|mainnet] \
  -- execute_plugin_action \
  --action '{"Swap": {"plugin": "SOROSWAP_PLUGIN_ID", "token_in": "TOKEN_A_ADDRESS", "token_out": "TOKEN_B_ADDRESS", "amount_in": 100000000, "amount_out_min": 90000000, "path": ["TOKEN_A_ADDRESS", "TOKEN_B_ADDRESS"], "deadline": 1717532800}}' \
  --signature ""  # Replace with actual signature if not called by owner
```

### 7. Add Liquidity to Soroswap

Add liquidity to Soroswap pools:

```bash
soroban contract invoke \
  --id USER_WALLET_ID \
  --source USER_ADDRESS \
  --network [standalone|testnet|mainnet] \
  -- execute_plugin_action \
  --action '{"AddLiquidity": {"plugin": "SOROSWAP_PLUGIN_ID", "token_a": "TOKEN_A_ADDRESS", "token_b": "TOKEN_B_ADDRESS", "amount_a_desired": 100000000, "amount_b_desired": 100000000, "amount_a_min": 90000000, "amount_b_min": 90000000, "deadline": 1717532800}}' \
  --signature ""  # Replace with actual signature if not called by owner
```

### 8. Remove Liquidity from Soroswap

Remove liquidity from Soroswap pools:

```bash
soroban contract invoke \
  --id USER_WALLET_ID \
  --source USER_ADDRESS \
  --network [standalone|testnet|mainnet] \
  -- execute_plugin_action \
  --action '{"RemoveLiquidity": {"plugin": "SOROSWAP_PLUGIN_ID", "token_a": "TOKEN_A_ADDRESS", "token_b": "TOKEN_B_ADDRESS", "liquidity": 50000000, "amount_a_min": 45000000, "amount_b_min": 45000000, "deadline": 1717532800}}' \
  --signature ""  # Replace with actual signature if not called by owner
```

## Signature Verification

For enhanced security, NexWallet supports operations using signatures. This allows transactions to be executed by authorized entities other than the owner:

1. Authorize additional signers:

```bash
soroban contract invoke \
  --id USER_WALLET_ID \
  --source USER_ADDRESS \
  --network [standalone|testnet|mainnet] \
  -- authorize_signer \
  --signer AUTHORIZED_SIGNER_ADDRESS
```

2. Generate a signature for an operation (off-chain)
3. Execute operations with the signature

## Security Considerations

- **Contract Upgradeability**: The wallet factory allows upgrading the wallet WASM for new deployments
- **Plugin Authorization**: Plugins must be explicitly authorized by wallet owners
- **Multi-signature**: Operations can be authorized by multiple signers
- **Admin Control**: Only the admin can register plugins with the factory

## Development

### Building the Contracts

```bash
cd wallet
cargo build --release
cd ../wallet-factory
cargo build --release
cd ../soroswap-plugin
cargo build --release
```

### Testing

```bash
cd wallet
cargo test
cd ../wallet-factory
cargo test
cd ../soroswap-plugin
cargo test
```

## License

This project is licensed under the MIT License.