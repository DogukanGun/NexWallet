#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{BytesN, Symbol, Val, Vec, Env, Address};

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
        let contract_id = env.register_contract(None, Wallet);
        let client = WalletClient::new(&env, &contract_id);
        let owner = test_address(&env, 1);
        client.initialize(&owner);
        assert_eq!(client.owner(), owner);
        assert_eq!(client.agents().len(), 0);
        assert_eq!(client.plugins().len(), 0);
    }

    #[test]
    fn test_add_and_remove_agent() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Wallet);
        let client = WalletClient::new(&env, &contract_id);
        let owner = test_address(&env, 1);
        let agent = test_address(&env, 2);
        client.initialize(&owner);
        client.add_agent(&agent);
        let agents = client.agents();
        assert!(agents.contains(&agent));
        client.remove_agent(&agent);
        let agents = client.agents();
        assert!(!agents.contains(&agent));
    }

    #[test]
    fn test_add_and_remove_plugin() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Wallet);
        let client = WalletClient::new(&env, &contract_id);
        let owner = test_address(&env, 1);
        let plugin = test_address(&env, 3);
        client.initialize(&owner);
        client.add_plugin(&plugin);
        let plugins = client.plugins();
        assert!(plugins.contains(&plugin));
        client.remove_plugin(&plugin);
        let plugins = client.plugins();
        assert!(!plugins.contains(&plugin));
    }

    #[test]
    fn test_transfer_token() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Wallet);
        let client = WalletClient::new(&env, &contract_id);
        let owner = test_address(&env, 1);
        let agent = test_address(&env, 2);
        let token = test_address(&env, 4);
        let to = test_address(&env, 5);
        client.initialize(&owner);
        client.add_agent(&agent);
        // Mock token contract not needed for logic test
        client.transfer_token(&token, &to, &100);
        // No panic = success
    }

    #[test]
    fn test_call_plugin() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Wallet);
        let client = WalletClient::new(&env, &contract_id);
        let owner = test_address(&env, 1);
        let plugin = test_address(&env, 3);
        client.initialize(&owner);
        client.add_plugin(&plugin);
        let function = Symbol::new(&env, "test_func");
        let args = Vec::<Val>::new(&env);
        let _ = client.call_plugin(&plugin, &function, &args);
        // No panic = success
    }
} 