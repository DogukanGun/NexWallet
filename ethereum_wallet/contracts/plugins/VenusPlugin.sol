// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IWalletPlugin.sol";

interface IVToken {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeem(uint256 redeemTokens) external returns (uint256);
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
    function borrow(uint256 borrowAmount) external returns (uint256);
    function repayBorrow(uint256 repayAmount) external returns (uint256);
    function underlying() external view returns (address);
}

interface IUnitroller {
    function enterMarkets(address[] calldata vTokens) external returns (uint256[] memory);
    function exitMarket(address vToken) external returns (uint256);
    function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256);
}

contract VenusPlugin is IWalletPlugin {
    IUnitroller public immutable unitroller;
    
    constructor(address _unitroller) {
        unitroller = IUnitroller(_unitroller);
    }

    function name() external pure override returns (string memory) {
        return "Venus";
    }
    
    function version() external pure override returns (string memory) {
        return "1.0.0";
    }

    function getSupportedFunctions() external pure override returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](6);
        selectors[0] = this.supply.selector;
        selectors[1] = this.withdraw.selector;
        selectors[2] = this.borrow.selector;
        selectors[3] = this.repay.selector;
        selectors[4] = this.enterMarkets.selector;
        selectors[5] = this.exitMarket.selector;
        return selectors;
    }

    function getFunctionSelector(string memory functionName) external pure override returns (bytes4) {
        bytes memory functionNameBytes = bytes(functionName);
        if (keccak256(functionNameBytes) == keccak256("supply")) {
            return this.supply.selector;
        } else if (keccak256(functionNameBytes) == keccak256("withdraw")) {
            return this.withdraw.selector;
        } else if (keccak256(functionNameBytes) == keccak256("borrow")) {
            return this.borrow.selector;
        } else if (keccak256(functionNameBytes) == keccak256("repay")) {
            return this.repay.selector;
        } else if (keccak256(functionNameBytes) == keccak256("enterMarkets")) {
            return this.enterMarkets.selector;
        } else if (keccak256(functionNameBytes) == keccak256("exitMarket")) {
            return this.exitMarket.selector;
        }
        revert("Function not found");
    }

    function execute(bytes4 functionSelector, bytes memory params) external payable override returns (bytes memory) {
        if (functionSelector == this.supply.selector) {
            (address vToken, uint256 amount) = abi.decode(params, (address, uint256));
            uint256 result = supply(vToken, amount);
            return abi.encode(result);
        } else if (functionSelector == this.withdraw.selector) {
            (address vToken, uint256 amount) = abi.decode(params, (address, uint256));
            uint256 result = withdraw(vToken, amount);
            return abi.encode(result);
        } else if (functionSelector == this.borrow.selector) {
            (address vToken, uint256 amount) = abi.decode(params, (address, uint256));
            uint256 result = borrow(vToken, amount);
            return abi.encode(result);
        } else if (functionSelector == this.repay.selector) {
            (address vToken, uint256 amount) = abi.decode(params, (address, uint256));
            uint256 result = repay(vToken, amount);
            return abi.encode(result);
        } else if (functionSelector == this.enterMarkets.selector) {
            (address[] memory vTokens) = abi.decode(params, (address[]));
            uint256[] memory results = enterMarkets(vTokens);
            return abi.encode(results);
        } else if (functionSelector == this.exitMarket.selector) {
            (address vToken) = abi.decode(params, (address));
            uint256 result = exitMarket(vToken);
            return abi.encode(result);
        }
        revert("Function not found");
    }
    
    function supply(address vToken, uint256 amount) public returns (uint256) {
        address underlying = IVToken(vToken).underlying();
        IERC20(underlying).approve(vToken, amount);
        return IVToken(vToken).mint(amount);
    }
    
    function withdraw(address vToken, uint256 amount) public returns (uint256) {
        return IVToken(vToken).redeemUnderlying(amount);
    }
    
    function borrow(address vToken, uint256 amount) public returns (uint256) {
        return IVToken(vToken).borrow(amount);
    }
    
    function repay(address vToken, uint256 amount) public returns (uint256) {
        address underlying = IVToken(vToken).underlying();
        IERC20(underlying).approve(vToken, amount);
        return IVToken(vToken).repayBorrow(amount);
    }
    
    function enterMarkets(address[] memory vTokens) public returns (uint256[] memory) {
        return unitroller.enterMarkets(vTokens);
    }
    
    function exitMarket(address vToken) public returns (uint256) {
        return unitroller.exitMarket(vToken);
    }
    
    function getAccountLiquidity() external view returns (uint256, uint256, uint256) {
        return unitroller.getAccountLiquidity(msg.sender);
    }
} 