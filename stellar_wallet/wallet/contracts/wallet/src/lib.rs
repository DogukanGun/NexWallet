#![no_std]
extern crate alloc;

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Symbol, Vec, BytesN, Val,
    token::Client as TokenClient,
};

#[contracttype]
pub enum DataKey {
    Owner,
    Agents,
    Plugins,
}

#[contract]
pub struct Wallet;

#[contractimpl]
impl Wallet {
    // Initialize the wallet with an owner
    pub fn initialize(env: Env, owner: Address) {
        if env.storage().instance().has(&DataKey::Owner) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::Agents, &Vec::<Address>::new(&env));
        env.storage().instance().set(&DataKey::Plugins, &Vec::<Address>::new(&env));
    }

    // Get the owner
    pub fn owner(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Owner).expect("not initialized")
    }

    // Add an agent (can call wallet functions)
    pub fn add_agent(env: Env, agent: Address) {
        Self::require_owner(env.clone());
        let mut agents: Vec<Address> = env.storage().instance().get(&DataKey::Agents).unwrap();
        if !agents.contains(&agent) {
            agents.push_back(agent);
            env.storage().instance().set(&DataKey::Agents, &agents);
        }
    }

    // Remove an agent
    pub fn remove_agent(env: Env, agent: Address) {
        Self::require_owner(env.clone());
        let agents: Vec<Address> = env.storage().instance().get(&DataKey::Agents).unwrap();
        let mut new_agents = Vec::new(&env);
        for a in agents.iter() {
            if a != agent {
                new_agents.push_back(a.clone());
            }
        }
        env.storage().instance().set(&DataKey::Agents, &new_agents);
    }

    // List agents
    pub fn agents(env: Env) -> Vec<Address> {
        env.storage().instance().get(&DataKey::Agents).unwrap()
    }

    // Add a plugin (extension contract)
    pub fn add_plugin(env: Env, plugin: Address) {
        Self::require_owner(env.clone());
        let mut plugins: Vec<Address> = env.storage().instance().get(&DataKey::Plugins).unwrap();
        if !plugins.contains(&plugin) {
            plugins.push_back(plugin);
            env.storage().instance().set(&DataKey::Plugins, &plugins);
        }
    }

    // Remove a plugin
    pub fn remove_plugin(env: Env, plugin: Address) {
        Self::require_owner(env.clone());
        let plugins: Vec<Address> = env.storage().instance().get(&DataKey::Plugins).unwrap();
        let mut new_plugins = Vec::new(&env);
        for p in plugins.iter() {
            if p != plugin {
                new_plugins.push_back(p.clone());
            }
        }
        env.storage().instance().set(&DataKey::Plugins, &new_plugins);
    }

    // List plugins
    pub fn plugins(env: Env) -> Vec<Address> {
        env.storage().instance().get(&DataKey::Plugins).unwrap()
    }

    // Transfer tokens (only owner/agent)
    pub fn transfer_token(env: Env, token: Address, to: Address, amount: i128) {
        Self::require_owner_or_agent(env.clone());
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &to, &amount);
    }

    // Call a plugin contract (only owner/agent, plugin must be authorized)
    pub fn call_plugin(env: Env, plugin: Address, function: Symbol, args: Vec<Val>) -> Val {
        Self::require_owner_or_agent(env.clone());
        let plugins: Vec<Address> = env.storage().instance().get(&DataKey::Plugins).unwrap();
        if !plugins.contains(&plugin) {
            panic!("plugin not authorized");
        }
        env.invoke_contract(&plugin, &function, args)
    }

    // Internal: require owner
    fn require_owner(env: Env) {
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        owner.require_auth();
    }

    // Internal: require owner or agent
    fn require_owner_or_agent(env: Env) {
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        // Only owner for now, as env.invoker() is not available
        owner.require_auth();
    }
} 