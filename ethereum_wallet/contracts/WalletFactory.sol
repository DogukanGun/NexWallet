// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./EthereumWallet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IWalletPlugin.sol";

contract WalletFactory is Ownable {
    mapping(address => address) public userWallets;
    mapping(address => bool) public registeredPlugins;
    mapping(string => address) public pluginsByName;
    address[] public allWallets;
    string[] public availablePlugins;
    
    event WalletCreated(address indexed user, address indexed wallet);
    event PluginRegistered(address indexed plugin, string name, string version);
    event PluginUnregistered(address indexed plugin);
    event PluginAddedToWallet(address indexed wallet, address indexed plugin);
    event PluginRemovedFromWallet(address indexed wallet, address indexed plugin);

    function createWallet() external returns (address) {
        require(userWallets[msg.sender] == address(0), "Wallet already exists");
        
        EthereumWallet wallet = new EthereumWallet(msg.sender);
        address walletAddress = address(wallet);
        
        userWallets[msg.sender] = walletAddress;
        allWallets.push(walletAddress);
        
        // Add all registered plugins to the new wallet
        for (uint i = 0; i < availablePlugins.length; i++) {
            address plugin = pluginsByName[availablePlugins[i]];
            if (registeredPlugins[plugin]) {
                wallet.addPlugin(plugin);
                emit PluginAddedToWallet(walletAddress, plugin);
            }
        }
        
        emit WalletCreated(msg.sender, walletAddress);
        return walletAddress;
    }

    function registerPlugin(address plugin) external onlyOwner {
        require(!registeredPlugins[plugin], "Plugin already registered");
        require(plugin.code.length > 0, "Invalid plugin address");
        
        IWalletPlugin pluginInstance = IWalletPlugin(plugin);
        string memory name = pluginInstance.name();
        string memory version = pluginInstance.version();
        
        require(pluginsByName[name] == address(0), "Plugin name already taken");
        
        registeredPlugins[plugin] = true;
        pluginsByName[name] = plugin;
        availablePlugins.push(name);
        
        // Add plugin to all existing wallets
        for (uint i = 0; i < allWallets.length; i++) {
            EthereumWallet wallet = EthereumWallet(payable(allWallets[i]));
            wallet.addPlugin(plugin);
            emit PluginAddedToWallet(allWallets[i], plugin);
        }
        
        emit PluginRegistered(plugin, name, version);
    }

    function unregisterPlugin(address plugin) external onlyOwner {
        require(registeredPlugins[plugin], "Plugin not registered");
        
        IWalletPlugin pluginInstance = IWalletPlugin(plugin);
        string memory name = pluginInstance.name();
        
        registeredPlugins[plugin] = false;
        delete pluginsByName[name];
        
        // Remove plugin from availablePlugins array
        for (uint i = 0; i < availablePlugins.length; i++) {
            if (keccak256(bytes(availablePlugins[i])) == keccak256(bytes(name))) {
                availablePlugins[i] = availablePlugins[availablePlugins.length - 1];
                availablePlugins.pop();
                break;
            }
        }
        
        // Remove plugin from all existing wallets
        for (uint i = 0; i < allWallets.length; i++) {
            EthereumWallet wallet = EthereumWallet(payable(allWallets[i]));
            wallet.removePlugin(plugin);
            emit PluginRemovedFromWallet(allWallets[i], plugin);
        }
        
        emit PluginUnregistered(plugin);
    }

    function getWalletAddress(address user) external view returns (address) {
        return userWallets[user];
    }

    function getAllWallets() external view returns (address[] memory) {
        return allWallets;
    }

    function getAvailablePlugins() external view returns (string[] memory) {
        return availablePlugins;
    }

    function getPluginAddress(string memory name) external view returns (address) {
        return pluginsByName[name];
    }

    function isPluginRegistered(address plugin) external view returns (bool) {
        return registeredPlugins[plugin];
    }
}
