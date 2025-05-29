// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockVToken {
    address public underlying;
    mapping(address => uint256) public balances;
    mapping(address => uint256) public borrows;

    constructor(address _underlying) {
        underlying = _underlying;
    }

    function mint(uint256 mintAmount) external returns (uint256) {
        require(IERC20(underlying).transferFrom(msg.sender, address(this), mintAmount), "Transfer failed");
        balances[msg.sender] += mintAmount;
        return 0; // Success
    }

    function redeem(uint256 redeemTokens) external returns (uint256) {
        require(balances[msg.sender] >= redeemTokens, "Insufficient balance");
        balances[msg.sender] -= redeemTokens;
        require(IERC20(underlying).transfer(msg.sender, redeemTokens), "Transfer failed");
        return 0; // Success
    }

    function redeemUnderlying(uint256 redeemAmount) external returns (uint256) {
        require(balances[msg.sender] >= redeemAmount, "Insufficient balance");
        balances[msg.sender] -= redeemAmount;
        require(IERC20(underlying).transfer(msg.sender, redeemAmount), "Transfer failed");
        return 0; // Success
    }

    function borrow(uint256 borrowAmount) external returns (uint256) {
        borrows[msg.sender] += borrowAmount;
        require(IERC20(underlying).transfer(msg.sender, borrowAmount), "Transfer failed");
        return 0; // Success
    }

    function repayBorrow(uint256 repayAmount) external returns (uint256) {
        require(IERC20(underlying).transferFrom(msg.sender, address(this), repayAmount), "Transfer failed");
        borrows[msg.sender] = borrows[msg.sender] > repayAmount ? borrows[msg.sender] - repayAmount : 0;
        return 0; // Success
    }
}

contract MockUnitroller {
    mapping(address => bool) public markets;
    mapping(address => uint256) public collateralValue;

    function enterMarkets(address[] calldata vTokens) external returns (uint256[] memory) {
        uint256[] memory results = new uint256[](vTokens.length);
        for(uint i = 0; i < vTokens.length; i++) {
            markets[vTokens[i]] = true;
            results[i] = 0; // Success
        }
        return results;
    }

    function exitMarket(address vToken) external returns (uint256) {
        markets[vToken] = false;
        return 0; // Success
    }

    function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256) {
        return (0, collateralValue[account], 0); // (Error, Liquidity, Shortfall)
    }

    // Helper function to set collateral value for testing
    function setCollateralValue(address account, uint256 value) external {
        collateralValue[account] = value;
    }
} 