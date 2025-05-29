// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IWalletPlugin.sol";

interface IPancakeRouter02 {
    function WETH() external pure returns (address);
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
    
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

contract PancakeSwapPlugin is IWalletPlugin {
    IPancakeRouter02 public immutable router;
    address public immutable WETH;
    
    constructor(address _router) {
        router = IPancakeRouter02(_router);
        WETH = router.WETH();
    }

    function name() external pure override returns (string memory) {
        return "PancakeSwap";
    }
    
    function version() external pure override returns (string memory) {
        return "1.0.0";
    }

    function getSupportedFunctions() external pure override returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = this.swapExactTokensForTokens.selector;
        selectors[1] = this.swapExactETHForTokens.selector;
        selectors[2] = this.swapExactTokensForETH.selector;
        return selectors;
    }

    function getFunctionSelector(string memory functionName) external pure override returns (bytes4) {
        bytes memory functionNameBytes = bytes(functionName);
        if (keccak256(functionNameBytes) == keccak256("swapExactTokensForTokens")) {
            return this.swapExactTokensForTokens.selector;
        } else if (keccak256(functionNameBytes) == keccak256("swapExactETHForTokens")) {
            return this.swapExactETHForTokens.selector;
        } else if (keccak256(functionNameBytes) == keccak256("swapExactTokensForETH")) {
            return this.swapExactTokensForETH.selector;
        }
        revert("Function not found");
    }

    function execute(bytes4 functionSelector, bytes memory params) external payable override returns (bytes memory) {
        if (functionSelector == this.swapExactTokensForTokens.selector) {
            (uint256 amountIn, uint256 amountOutMin, address[] memory path, uint256 deadline) = 
                abi.decode(params, (uint256, uint256, address[], uint256));
            uint[] memory amounts = swapExactTokensForTokens(amountIn, amountOutMin, path, deadline);
            return abi.encode(amounts);
        } else if (functionSelector == this.swapExactETHForTokens.selector) {
            (uint256 amountOutMin, address[] memory path, uint256 deadline) = 
                abi.decode(params, (uint256, address[], uint256));
            uint[] memory amounts = router.swapExactETHForTokens{value: msg.value}(
                amountOutMin,
                path,
                msg.sender,
                deadline
            );
            return abi.encode(amounts);
        } else if (functionSelector == this.swapExactTokensForETH.selector) {
            (uint256 amountIn, uint256 amountOutMin, address[] memory path, uint256 deadline) = 
                abi.decode(params, (uint256, uint256, address[], uint256));
            uint[] memory amounts = swapExactTokensForETH(amountIn, amountOutMin, path, deadline);
            return abi.encode(amounts);
        }
        revert("Function not found");
    }
    
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] memory path,
        uint256 deadline
    ) public returns (uint[] memory amounts) {
        IERC20(path[0]).approve(address(router), amountIn);
        return router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
    }
    
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] memory path,
        uint256 deadline
    ) public payable returns (uint[] memory amounts) {
        require(path[0] == WETH, "PancakeSwapPlugin: INVALID_PATH");
        return router.swapExactETHForTokens{value: msg.value}(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
    }
    
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] memory path,
        uint256 deadline
    ) public returns (uint[] memory amounts) {
        require(path[path.length - 1] == WETH, "PancakeSwapPlugin: INVALID_PATH");
        IERC20(path[0]).approve(address(router), amountIn);
        return router.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        uint256 deadline
    ) public returns (uint amountA, uint amountB, uint liquidity) {
        IERC20(tokenA).approve(address(router), amountADesired);
        IERC20(tokenB).approve(address(router), amountBDesired);
        return router.addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            address(this),
            deadline
        );
    }
    
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        uint256 deadline
    ) public payable returns (uint amountToken, uint amountETH, uint liquidity) {
        IERC20(token).approve(address(router), amountTokenDesired);
        return router.addLiquidityETH{value: msg.value}(
            token,
            amountTokenDesired,
            amountTokenMin,
            amountETHMin,
            address(this),
            deadline
        );
    }
    
    receive() external payable {}
} 