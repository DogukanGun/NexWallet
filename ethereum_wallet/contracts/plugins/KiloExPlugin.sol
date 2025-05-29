// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IKiloExRouter {
    struct Position {
        uint256 size;
        uint256 collateral;
        int256 entryPrice;
        int256 entryFundingRate;
        uint256 reserveAmount;
        int256 realisedPnl;
        uint256 lastIncreasedTime;
    }

    function createIncreasePosition(
        address[] memory _path,
        address _indexToken,
        uint256 _amountIn,
        uint256 _minOut,
        uint256 _sizeDelta,
        bool _isLong,
        uint256 _acceptablePrice,
        uint256 _executionFee,
        bytes32 _referralCode,
        address _callbackTarget
    ) external payable;

    function createDecreasePosition(
        address[] memory _path,
        address _indexToken,
        uint256 _collateralDelta,
        uint256 _sizeDelta,
        bool _isLong,
        address _receiver,
        uint256 _acceptablePrice,
        uint256 _minOut,
        uint256 _executionFee,
        bool _withdrawETH,
        address _callbackTarget
    ) external payable;

    function getPosition(
        address _account,
        address _indexToken,
        bool _isLong
    ) external view returns (Position memory);
}

contract KiloExPlugin {
    IKiloExRouter public immutable router;
    
    constructor(address _router) {
        router = IKiloExRouter(_router);
    }
    
    function openPosition(
        address[] memory path,
        address indexToken,
        uint256 amountIn,
        uint256 minOut,
        uint256 sizeDelta,
        bool isLong,
        uint256 acceptablePrice,
        uint256 executionFee,
        bytes32 referralCode
    ) external payable {
        if (path.length > 0) {
            IERC20(path[0]).approve(address(router), amountIn);
        }
        
        router.createIncreasePosition{value: msg.value}(
            path,
            indexToken,
            amountIn,
            minOut,
            sizeDelta,
            isLong,
            acceptablePrice,
            executionFee,
            referralCode,
            address(this)
        );
    }
    
    function closePosition(
        address[] memory path,
        address indexToken,
        uint256 collateralDelta,
        uint256 sizeDelta,
        bool isLong,
        uint256 acceptablePrice,
        uint256 minOut,
        uint256 executionFee,
        bool withdrawETH
    ) external payable {
        router.createDecreasePosition{value: msg.value}(
            path,
            indexToken,
            collateralDelta,
            sizeDelta,
            isLong,
            address(this),
            acceptablePrice,
            minOut,
            executionFee,
            withdrawETH,
            address(this)
        );
    }
    
    function getPosition(
        address indexToken,
        bool isLong
    ) external view returns (IKiloExRouter.Position memory) {
        return router.getPosition(address(this), indexToken, isLong);
    }
    
    receive() external payable {}
} 