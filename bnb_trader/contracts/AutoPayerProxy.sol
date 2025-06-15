// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

/**
 * @title AutoPayerProxy
 * @dev Transparent upgradeable proxy for AutoPayer contract
 */
contract AutoPayerProxy is TransparentUpgradeableProxy {
    
    /**
     * @dev Initialize the proxy with implementation, admin, and initialization data
     * @param _logic Implementation contract address
     * @param _admin Admin address (usually a ProxyAdmin contract)
     * @param _data Initialization data for the implementation contract
     */
    constructor(
        address _logic,
        address _admin,
        bytes memory _data
    ) TransparentUpgradeableProxy(_logic, _admin, _data) {
        // The proxy is automatically initialized by the parent constructor
    }
}

/**
 * @title AutoPayerProxyAdmin
 * @dev ProxyAdmin contract for managing AutoPayer proxy upgrades
 */
contract AutoPayerProxyAdmin is ProxyAdmin {
    
    /**
     * @dev Constructor that sets the initial admin
     * @param _initialAdmin Initial admin address (should be a multisig or governance contract)
     */
    constructor(address _initialAdmin) ProxyAdmin(_initialAdmin) {
        // ProxyAdmin is initialized with the admin
    }
} 