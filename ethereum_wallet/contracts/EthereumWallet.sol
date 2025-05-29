// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IWalletPlugin.sol";

contract EthereumWallet is ReentrancyGuard {
    using ECDSA for bytes32;

    address public owner;
    address public factory;
    mapping(address => bool) public authorizedPlugins;
    
    event EtherReceived(address indexed from, uint256 amount);
    event EtherSent(address indexed to, uint256 amount);
    event TokenTransferred(address indexed token, address indexed to, uint256 amount);
    event PluginAdded(address indexed plugin);
    event PluginRemoved(address indexed plugin);
    event PluginExecuted(address indexed plugin, bytes4 indexed functionSelector);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call this function");
        _;
    }

    modifier onlyAuthorizedPlugin(address plugin) {
        require(authorizedPlugins[plugin], "Plugin not authorized");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
        factory = msg.sender;
    }

    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    function transferEther(address payable _to, uint256 _amount, bytes memory signature) external nonReentrant {
        bytes32 messageHash = keccak256(abi.encodePacked(
            _to,
            _amount,
            address(this)
        ));
        
        require(isValidSignature(messageHash, signature), "Invalid signature");
        require(address(this).balance >= _amount, "Insufficient balance");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit EtherSent(_to, _amount);
    }

    function transferToken(
        address _token,
        address _to,
        uint256 _amount,
        bytes memory signature
    ) external nonReentrant {
        bytes32 messageHash = keccak256(abi.encodePacked(
            _token,
            _to,
            _amount,
            address(this)
        ));
        
        require(isValidSignature(messageHash, signature), "Invalid signature");
        
        IERC20 token = IERC20(_token);
        require(token.balanceOf(address(this)) >= _amount, "Insufficient token balance");
        
        require(token.transfer(_to, _amount), "Token transfer failed");
        emit TokenTransferred(_token, _to, _amount);
    }

    function executePlugin(
        string memory pluginName,
        string memory functionName,
        bytes memory params,
        bytes memory signature
    ) external payable nonReentrant returns (bytes memory) {
        address plugin = IWalletFactory(factory).getPluginAddress(pluginName);
        require(plugin != address(0), "Plugin not found");
        require(authorizedPlugins[plugin], "Plugin not authorized");
        
        IWalletPlugin pluginInstance = IWalletPlugin(plugin);
        bytes4 functionSelector = pluginInstance.getFunctionSelector(functionName);
        
        bytes32 messageHash = keccak256(abi.encodePacked(
            plugin,
            functionSelector,
            params,
            address(this)
        ));
        
        require(isValidSignature(messageHash, signature), "Invalid signature");
        
        bytes memory result = pluginInstance.execute{value: msg.value}(functionSelector, params);
        emit PluginExecuted(plugin, functionSelector);
        
        return result;
    }

    function isValidSignature(bytes32 messageHash, bytes memory signature) public view returns (bool) {
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        return signer == owner;
    }

    function addPlugin(address plugin) external onlyFactory {
        authorizedPlugins[plugin] = true;
        emit PluginAdded(plugin);
    }

    function removePlugin(address plugin) external onlyFactory {
        authorizedPlugins[plugin] = false;
        emit PluginRemoved(plugin);
    }
}

interface IWalletFactory {
    function getPluginAddress(string memory name) external view returns (address);
}
