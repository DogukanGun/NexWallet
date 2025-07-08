#![no_std]
extern crate alloc;

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, BytesN, Vec, Symbol, Val, Map, IntoVal,
};
use alloc::string::ToString;

#[contracttype]
pub enum DataKey {
    Admin,
    WalletWasm,
    WalletsByOwner,
    Plugins,
}

#[contract]
pub struct WalletFactory;

#[contractimpl]
impl WalletFactory {
    // Initialize the factory with admin and wallet wasm hash
    pub fn initialize(env: Env, admin: Address, wallet_wasm: BytesN<32>) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::WalletWasm, &wallet_wasm);
        env.storage().instance().set(&DataKey::Plugins, &Vec::<Address>::new(&env));
        env.storage().instance().set(&DataKey::WalletsByOwner, &Map::<Address, Vec<Address>>::new(&env));
    }

    // Get admin
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).expect("not initialized")
    }

    // Update wallet wasm hash (admin only)
    pub fn update_wallet_wasm(env: Env, wallet_wasm: BytesN<32>) {
        Self::require_admin(env.clone());
        env.storage().instance().set(&DataKey::WalletWasm, &wallet_wasm);
    }

    // Register a plugin (admin only)
    pub fn register_plugin(env: Env, plugin: Address) {
        Self::require_admin(env.clone());
        let mut plugins: Vec<Address> = env.storage().instance().get(&DataKey::Plugins).unwrap();
        if !plugins.contains(&plugin) {
            plugins.push_back(plugin);
            env.storage().instance().set(&DataKey::Plugins, &plugins);
        }
    }

    // Unregister a plugin (admin only)
    pub fn unregister_plugin(env: Env, plugin: Address) {
        Self::require_admin(env.clone());
        let plugins: Vec<Address> = env.storage().instance().get(&DataKey::Plugins).unwrap();
        let mut new_plugins = Vec::new(&env);
        for p in plugins.iter() {
            if p != plugin {
                new_plugins.push_back(p.clone());
            }
        }
        env.storage().instance().set(&DataKey::Plugins, &new_plugins);
    }

    // List registered plugins
    pub fn plugins(env: Env) -> Vec<Address> {
        env.storage().instance().get(&DataKey::Plugins).unwrap()
    }

    // Deploy a new wallet for the given owner
    pub fn create_wallet(env: Env, owner: Address) -> Address {
        let wallet_wasm: BytesN<32> = env.storage().instance().get(&DataKey::WalletWasm).unwrap();
        let mut wallets_by_owner: Map<Address, Vec<Address>> = env.storage().instance().get(&DataKey::WalletsByOwner).unwrap();
        let mut wallets = wallets_by_owner.get(owner.clone()).unwrap_or(Vec::new(&env));
        // Use a static salt for test purposes
        let salt_bytes: BytesN<32> = BytesN::from_array(&env, &[0u8; 32]);
        let wallet_address = env.deployer().with_current_contract(salt_bytes).deploy(wallet_wasm);
        // Initialize wallet with owner
        let init_fn = Symbol::new(&env, "initialize");
        let mut args = Vec::<Val>::new(&env);
        args.push_back(owner.clone().to_val());
        env.invoke_contract::<()>(&wallet_address, &init_fn, args);
        // Register plugins for wallet
        let plugins: Vec<Address> = env.storage().instance().get(&DataKey::Plugins).unwrap();
        for plugin in plugins.iter() {
            let add_plugin_fn = Symbol::new(&env, "add_plugin");
            let mut plugin_args = Vec::<Val>::new(&env);
            plugin_args.push_back(plugin.clone().to_val());
            env.invoke_contract::<()>(&wallet_address, &add_plugin_fn, plugin_args);
        }
        // Track wallet for owner
        wallets.push_back(wallet_address.clone());
        wallets_by_owner.set(owner, wallets);
        env.storage().instance().set(&DataKey::WalletsByOwner, &wallets_by_owner);
        wallet_address
    }

    // List wallets by owner
    pub fn wallets_by_owner(env: Env, owner: Address) -> Vec<Address> {
        let wallets_by_owner: Map<Address, Vec<Address>> = env.storage().instance().get(&DataKey::WalletsByOwner).unwrap();
        wallets_by_owner.get(owner).unwrap_or(Vec::new(&env))
    }

    // Internal: require admin
    fn require_admin(env: Env) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{BytesN, Env, Address};

    fn test_address(env: &Env, n: u8) -> Address {
        // Use valid Stellar strkey addresses for tests
        match n {
            1 => Address::from_str(env, "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
            2 => Address::from_str(env, "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBR4Y"),
            3 => Address::from_str(env, "GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCQ"),
            4 => Address::from_str(env, "GDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"),
            5 => Address::from_str(env, "GEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEQ"),
            _ => Address::from_str(env, "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
        }
    }

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, WalletFactory);
        let client = WalletFactoryClient::new(&env, &contract_id);
        let admin = test_address(&env, 1);
        let wallet_wasm = BytesN::from_array(&env, &[0u8; 32]);
        client.initialize(&admin, &wallet_wasm);
        assert_eq!(client.admin(), admin);
        assert_eq!(client.plugins().len(), 0);
    }

    #[test]
    fn test_register_and_unregister_plugin() {
        let env = Env::default();
        let contract_id = env.register_contract(None, WalletFactory);
        let client = WalletFactoryClient::new(&env, &contract_id);
        let admin = test_address(&env, 2);
        let plugin = test_address(&env, 3);
        let wallet_wasm = BytesN::from_array(&env, &[0u8; 32]);
        client.initialize(&admin, &wallet_wasm);
        client.register_plugin(&plugin);
        let plugins = client.plugins();
        assert!(plugins.contains(&plugin));
        client.unregister_plugin(&plugin);
        let plugins = client.plugins();
        assert!(!plugins.contains(&plugin));
    }

    #[test]
    fn test_create_wallet() {
        let env = Env::default();
        let contract_id = env.register_contract(None, WalletFactory);
        let client = WalletFactoryClient::new(&env, &contract_id);
        let admin = test_address(&env, 4);
        let owner = test_address(&env, 5);
        let wallet_wasm = BytesN::from_array(&env, &[0u8; 32]);
        client.initialize(&admin, &wallet_wasm);
        let wallet = client.create_wallet(&owner);
        let wallets = client.wallets_by_owner(&owner);
        assert!(wallets.contains(&wallet));
    }
} 