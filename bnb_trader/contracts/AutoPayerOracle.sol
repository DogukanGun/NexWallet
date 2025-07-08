// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AutoPayerOracle
 * @dev Oracle contract for managing constants, exchange rates, and external data
 */
contract AutoPayerOracle is AccessControl, Pausable {
    
    bytes32 public constant ORACLE_ADMIN_ROLE = keccak256("ORACLE_ADMIN_ROLE");
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    
    // Exchange rates (1 unit of fiat = X tokens, scaled by 1e18)
    mapping(string => mapping(address => uint256)) public exchangeRates; // currency => token => rate
    mapping(string => uint256) public lastRateUpdate; // currency => timestamp
    
    // Platform constants
    uint256 public platformFeeRate = 100; // 1% in basis points
    uint256 public constant MAX_FEE_RATE = 1000; // 10% maximum
    uint256 public escrowDuration = 7 days;
    uint256 public verificationTimeout = 24 hours;
    uint256 public minEscrowAmount = 1e18; // 1 token minimum
    uint256 public maxEscrowAmount = 1000000e18; // 1M tokens maximum
    
    // Supported currencies and tokens
    mapping(string => bool) public supportedCurrencies;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint8) public tokenDecimals;
    
    // Rate deviation limits (in basis points)
    uint256 public maxRateDeviation = 500; // 5% maximum deviation
    uint256 public rateValidityPeriod = 3600; // 1 hour
    
    // Events
    event ExchangeRateUpdated(string indexed currency, address indexed token, uint256 newRate, uint256 timestamp);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event EscrowDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event CurrencySupported(string currency, bool supported);
    event TokenSupported(address indexed token, bool supported, uint8 decimals);
    event ConstantUpdated(string indexed key, uint256 oldValue, uint256 newValue);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ADMIN_ROLE, msg.sender);
        _grantRole(PRICE_UPDATER_ROLE, msg.sender);
        
        // Initialize supported currencies
        supportedCurrencies["EUR"] = true;
        supportedCurrencies["USD"] = true;
        supportedCurrencies["GBP"] = true;
    }
    
    /**
     * @dev Update exchange rate for a currency-token pair
     * @param _currency Fiat currency code (e.g., "EUR", "USD")
     * @param _token Token contract address
     * @param _rate Exchange rate (1 fiat unit = _rate tokens, scaled by 1e18)
     */
    function updateExchangeRate(
        string memory _currency,
        address _token,
        uint256 _rate
    ) external onlyRole(PRICE_UPDATER_ROLE) whenNotPaused {
        require(supportedCurrencies[_currency], "Currency not supported");
        require(supportedTokens[_token], "Token not supported");
        require(_rate > 0, "Rate must be greater than 0");
        
        // Check rate deviation if previous rate exists
        uint256 currentRate = exchangeRates[_currency][_token];
        if (currentRate > 0) {
            uint256 deviation = _rate > currentRate 
                ? ((_rate - currentRate) * 10000) / currentRate
                : ((currentRate - _rate) * 10000) / currentRate;
            require(deviation <= maxRateDeviation, "Rate deviation too high");
        }
        
        exchangeRates[_currency][_token] = _rate;
        lastRateUpdate[_currency] = block.timestamp;
        
        emit ExchangeRateUpdated(_currency, _token, _rate, block.timestamp);
    }
    
    /**
     * @dev Get exchange rate for currency-token pair
     * @param _currency Fiat currency code
     * @param _token Token contract address
     * @return rate Exchange rate, validity (true if rate is fresh)
     */
    function getExchangeRate(string memory _currency, address _token) 
        external 
        view 
        returns (uint256 rate, bool isValid) 
    {
        rate = exchangeRates[_currency][_token];
        uint256 lastUpdate = lastRateUpdate[_currency];
        isValid = (block.timestamp - lastUpdate) <= rateValidityPeriod && rate > 0;
    }
    
    /**
     * @dev Calculate token amount for given fiat amount
     * @param _currency Fiat currency code
     * @param _token Token contract address
     * @param _fiatAmount Fiat amount in cents
     * @return tokenAmount Required token amount
     */
    function calculateTokenAmount(
        string memory _currency,
        address _token,
        uint256 _fiatAmount
    ) external view returns (uint256 tokenAmount) {
        uint256 rate = exchangeRates[_currency][_token];
        require(rate > 0, "Exchange rate not available");
        require(
            (block.timestamp - lastRateUpdate[_currency]) <= rateValidityPeriod,
            "Exchange rate too old"
        );
        
        // Convert fiat cents to token amount
        // rate is tokens per 1 fiat unit (scaled by 1e18)
        // fiatAmount is in cents, so divide by 100
        tokenAmount = (_fiatAmount * rate) / 100;
    }
    
    /**
     * @dev Set platform fee rate
     * @param _feeRate New fee rate in basis points
     */
    function setPlatformFeeRate(uint256 _feeRate) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        require(_feeRate <= MAX_FEE_RATE, "Fee rate too high");
        uint256 oldFee = platformFeeRate;
        platformFeeRate = _feeRate;
        emit PlatformFeeUpdated(oldFee, _feeRate);
    }
    
    /**
     * @dev Set escrow duration
     * @param _duration New duration in seconds
     */
    function setEscrowDuration(uint256 _duration) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        require(_duration >= 1 hours && _duration <= 30 days, "Invalid duration");
        uint256 oldDuration = escrowDuration;
        escrowDuration = _duration;
        emit EscrowDurationUpdated(oldDuration, _duration);
    }
    
    /**
     * @dev Set verification timeout
     * @param _timeout New timeout in seconds
     */
    function setVerificationTimeout(uint256 _timeout) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        require(_timeout >= 1 hours && _timeout <= 7 days, "Invalid timeout");
        verificationTimeout = _timeout;
        emit ConstantUpdated("verificationTimeout", verificationTimeout, _timeout);
    }
    
    /**
     * @dev Set escrow amount limits
     * @param _minAmount Minimum escrow amount
     * @param _maxAmount Maximum escrow amount
     */
    function setEscrowLimits(uint256 _minAmount, uint256 _maxAmount) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        require(_minAmount > 0 && _maxAmount > _minAmount, "Invalid limits");
        minEscrowAmount = _minAmount;
        maxEscrowAmount = _maxAmount;
        emit ConstantUpdated("minEscrowAmount", minEscrowAmount, _minAmount);
        emit ConstantUpdated("maxEscrowAmount", maxEscrowAmount, _maxAmount);
    }
    
    /**
     * @dev Add or remove supported currency
     * @param _currency Currency code
     * @param _supported Whether currency is supported
     */
    function setSupportedCurrency(string memory _currency, bool _supported) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        supportedCurrencies[_currency] = _supported;
        emit CurrencySupported(_currency, _supported);
    }
    
    /**
     * @dev Add or remove supported token
     * @param _token Token contract address
     * @param _supported Whether token is supported
     * @param _decimals Token decimals
     */
    function setSupportedToken(address _token, bool _supported, uint8 _decimals) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        supportedTokens[_token] = _supported;
        if (_supported) {
            tokenDecimals[_token] = _decimals;
        }
        emit TokenSupported(_token, _supported, _decimals);
    }
    
    /**
     * @dev Set rate deviation limits
     * @param _maxDeviation Maximum allowed rate deviation in basis points
     * @param _validityPeriod Rate validity period in seconds
     */
    function setRateLimits(uint256 _maxDeviation, uint256 _validityPeriod) 
        external 
        onlyRole(ORACLE_ADMIN_ROLE) 
    {
        require(_maxDeviation <= 2000, "Max deviation too high"); // 20% max
        require(_validityPeriod >= 300 && _validityPeriod <= 86400, "Invalid validity period"); // 5min - 24h
        
        maxRateDeviation = _maxDeviation;
        rateValidityPeriod = _validityPeriod;
        emit ConstantUpdated("maxRateDeviation", maxRateDeviation, _maxDeviation);
        emit ConstantUpdated("rateValidityPeriod", rateValidityPeriod, _validityPeriod);
    }
    
    /**
     * @dev Check if escrow amount is within limits
     * @param _amount Amount to check
     * @return valid Whether amount is valid
     */
    function isValidEscrowAmount(uint256 _amount) external view returns (bool valid) {
        return _amount >= minEscrowAmount && _amount <= maxEscrowAmount;
    }
    
    /**
     * @dev Get all platform constants
     * @return _platformFeeRate Platform fee rate in basis points
     * @return _escrowDuration Escrow duration in seconds
     * @return _verificationTimeout Verification timeout in seconds
     * @return _minEscrowAmount Minimum escrow amount
     * @return _maxEscrowAmount Maximum escrow amount
     * @return _maxRateDeviation Maximum rate deviation in basis points
     * @return _rateValidityPeriod Rate validity period in seconds
     */
    function getPlatformConstants() external view returns (
        uint256 _platformFeeRate,
        uint256 _escrowDuration,
        uint256 _verificationTimeout,
        uint256 _minEscrowAmount,
        uint256 _maxEscrowAmount,
        uint256 _maxRateDeviation,
        uint256 _rateValidityPeriod
    ) {
        return (
            platformFeeRate,
            escrowDuration,
            verificationTimeout,
            minEscrowAmount,
            maxEscrowAmount,
            maxRateDeviation,
            rateValidityPeriod
        );
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(ORACLE_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(ORACLE_ADMIN_ROLE) {
        _unpause();
    }
} 