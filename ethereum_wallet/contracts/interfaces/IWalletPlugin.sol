// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IWalletPlugin {
    /// @notice Returns the name of the plugin
    function name() external pure returns (string memory);
    
    /// @notice Returns the version of the plugin
    function version() external pure returns (string memory);
    
    /// @notice Returns all function selectors supported by this plugin
    function getSupportedFunctions() external pure returns (bytes4[] memory);
    
    /// @notice Returns the function selector for a given function name
    /// @param functionName The name of the function
    /// @return The function selector (first 4 bytes of the function signature)
    function getFunctionSelector(string memory functionName) external pure returns (bytes4);
    
    /// @notice Executes a function call on the plugin
    /// @param functionSelector The selector of the function to execute
    /// @param params The encoded parameters for the function
    /// @return Any return data from the function execution
    function execute(bytes4 functionSelector, bytes memory params) external payable returns (bytes memory);
} 