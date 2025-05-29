// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockPancakeRouter {
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(deadline >= block.timestamp, "PancakeRouter: EXPIRED");
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        for(uint i = 1; i < path.length; i++) {
            amounts[i] = amountIn * 98 / 100; // Simulating 2% slippage
        }
        return amounts;
    }
    
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts) {
        require(deadline >= block.timestamp, "PancakeRouter: EXPIRED");
        require(path[0] == WETH, "PancakeRouter: INVALID_PATH");
        amounts = new uint[](path.length);
        amounts[0] = msg.value;
        for(uint i = 1; i < path.length; i++) {
            amounts[i] = msg.value * 98 / 100; // Simulating 2% slippage
        }
        return amounts;
    }
    
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(deadline >= block.timestamp, "PancakeRouter: EXPIRED");
        require(path[path.length - 1] == WETH, "PancakeRouter: INVALID_PATH");
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        for(uint i = 1; i < path.length; i++) {
            amounts[i] = amountIn * 98 / 100; // Simulating 2% slippage
        }
        return amounts;
    }

    receive() external payable {}
} 