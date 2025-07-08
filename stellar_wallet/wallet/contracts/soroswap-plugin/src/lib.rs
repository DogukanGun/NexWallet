#![no_std]
extern crate alloc;

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, token::Client as TokenClient, Vec, Symbol, Val,
};
use alloc::string::ToString;

#[contracttype]
pub enum DataKey {
    Owner, // The wallet contract that owns this plugin
}

#[contract]
pub struct SoroswapPlugin;

#[contractimpl]
impl SoroswapPlugin {
    // Initialize the plugin with the wallet contract as owner
    pub fn initialize(env: Env, owner: Address) {
        if env.storage().instance().has(&DataKey::Owner) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Owner, &owner);
    }

    // Get the owner (wallet contract)
    pub fn owner(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Owner).expect("not initialized")
    }

    // Example: atomic swap entrypoint (only callable by owner)
    pub fn atomic_swap(
        env: Env,
        token_a: Address,
        token_b: Address,
        from_a: Address,
        from_b: Address,
        amount_a: i128,
        min_b_for_a: i128,
        amount_b: i128,
        min_a_for_b: i128,
    ) {
        Self::require_owner(env.clone());
        // Preconditions
        if amount_b < min_b_for_a {
            panic!("not enough token B for token A");
        }
        if amount_a < min_a_for_b {
            panic!("not enough token A for token B");
        }
        // Move tokens atomically
        Self::move_token(&env, &token_a, &from_a, &from_b, amount_a, min_a_for_b);
        Self::move_token(&env, &token_b, &from_b, &from_a, amount_b, min_b_for_a);
    }

    fn move_token(
        env: &Env,
        token: &Address,
        from: &Address,
        to: &Address,
        max_spend_amount: i128,
        transfer_amount: i128,
    ) {
        let token = TokenClient::new(env, token);
        let contract_address = env.current_contract_address();
        // Transfer max_spend_amount from 'from' to this contract
        token.transfer(from, &contract_address, &max_spend_amount);
        // Transfer transfer_amount from this contract to 'to'
        token.transfer(&contract_address, to, &transfer_amount);
        // Refund the rest to 'from'
        token.transfer(&contract_address, from, &(max_spend_amount - transfer_amount));
    }

    // Internal: require only the wallet contract can call
    fn require_owner(env: Env) {
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        owner.require_auth();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{Env, Address};

    fn create_test_address(env: &Env, _n: u8) -> Address {
        Address::from_str(env, "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF")
    }

    #[test]
    fn test_initialize_and_owner() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SoroswapPlugin);
        let client = SoroswapPluginClient::new(&env, &contract_id);
        let owner = create_test_address(&env, 1);
        client.initialize(&owner);
        assert_eq!(client.owner(), owner);
    }

    #[test]
    fn test_atomic_swap() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SoroswapPlugin);
        let client = SoroswapPluginClient::new(&env, &contract_id);
        let owner = create_test_address(&env, 1);
        let token_a = create_test_address(&env, 2);
        let token_b = create_test_address(&env, 3);
        let from_a = create_test_address(&env, 4);
        let from_b = create_test_address(&env, 5);
        client.initialize(&owner);
        client.atomic_swap(&token_a, &token_b, &from_a, &from_b, &100, &90, &200, &80);
        // No panic = success
    }
} 