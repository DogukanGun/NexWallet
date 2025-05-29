// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract UniswapV2Plugin {
    IUniswapV2Router02 public immutable uniswapRouter;
    
    constructor(address _uniswapRouter) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }
    
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        uint256 deadline
    ) external returns (uint[] memory amounts) {
        IERC20(path[0]).approve(address(uniswapRouter), amountIn);
        
        return uniswapRouter.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this), // The wallet contract will be msg.sender
            deadline
        );
    }
    
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        uint256 deadline
    ) external payable returns (uint[] memory amounts) {
        require(path[0] == uniswapRouter.WETH(), "First token must be WETH");
        
        return uniswapRouter.swapExactETHForTokens{value: msg.value}(
            amountOutMin,
            path,
            address(this), // The wallet contract will be msg.sender
            deadline
        );
    }
    
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        uint256 deadline
    ) external returns (uint[] memory amounts) {
        require(path[path.length - 1] == uniswapRouter.WETH(), "Last token must be WETH");
        
        IERC20(path[0]).approve(address(uniswapRouter), amountIn);
        
        return uniswapRouter.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            address(this), // The wallet contract will be msg.sender
            deadline
        );
    }
} 