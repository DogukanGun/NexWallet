// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "./AutoPayerImplementation.sol";
import "./AutoPayerOracle.sol";
import "./AutoPayerProxy.sol";

/**
 * @title AutoPayerManager
 * @dev Factory and manager contract for AutoPayer instances
 */
contract AutoPayerManager is AccessControl, Pausable {
    
    bytes32 public constant MANAGER_ADMIN_ROLE = keccak256("MANAGER_ADMIN_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Template contract for cloning
    address public autoPayerImplementation;
    AutoPayerOracle public oracle;
    AutoPayerProxyAdmin public proxyAdmin;
    
    // Deployment tracking
    mapping(address => bool) public isAutoPayerInstance;
    mapping(address => address[]) public userInstances;
    address[] public allInstances;
    
    // Access control
    mapping(address => bool) public authorizedCreators;
    mapping(address => uint256) public creatorLimit; // Max instances per creator
    mapping(address => uint256) public creatorCount; // Current instances per creator
    
    // Fee structure for creators
    uint256 public creationFee = 0; // Fee to create new instance
    uint256 public creatorCommission = 0; // Basis points (0-10000)
    address public feeRecipient;
    
    // Instance limits
    uint256 public maxInstancesPerCreator = 10;
    uint256 public totalInstanceLimit = 1000;
    
    // Events
    event AutoPayerCreated(
        address indexed creator,
        address indexed proxy,
        address indexed implementation,
        address feeRecipient,
        uint256 instanceCount
    );
    event CreatorAuthorized(address indexed creator, bool authorized, uint256 limit);
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event FeesUpdated(uint256 creationFee, uint256 creatorCommission);
    
    constructor(
        address _autoPayerImplementation, 
        address _oracle, 
        address _feeRecipient,
        address _proxyAdminOwner
    ) {
        autoPayerImplementation = _autoPayerImplementation;
        oracle = AutoPayerOracle(_oracle);
        feeRecipient = _feeRecipient;
        
        // Deploy ProxyAdmin for managing upgrades
        proxyAdmin = new AutoPayerProxyAdmin(_proxyAdminOwner);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        
        // Authorize deployer as creator
        authorizedCreators[msg.sender] = true;
        creatorLimit[msg.sender] = maxInstancesPerCreator;
    }
    
    /**
     * @dev Create a new AutoPayer instance using transparent proxy
     * @param _instanceOwner Owner of the new AutoPayer instance
     * @param _instanceFeeRecipient Fee recipient for the instance
     * @return proxy Address of the new AutoPayer proxy
     */
    function createAutoPayerInstance(
        address _instanceOwner,
        address _instanceFeeRecipient
    ) external payable onlyRole(CREATOR_ROLE) whenNotPaused returns (address proxy) {
        require(authorizedCreators[msg.sender], "Not authorized creator");
        require(creatorCount[msg.sender] < creatorLimit[msg.sender], "Creator limit exceeded");
        require(allInstances.length < totalInstanceLimit, "Total instance limit exceeded");
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(_instanceOwner != address(0), "Invalid instance owner");
        require(_instanceFeeRecipient != address(0), "Invalid fee recipient");
        
        // Prepare initialization data
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,address,address,address)",
            _instanceOwner,
            _instanceFeeRecipient,
            address(oracle),
            address(this)
        );
        
        // Deploy transparent proxy
        proxy = address(new AutoPayerProxy(
            autoPayerImplementation,
            address(proxyAdmin),
            initData
        ));
        
        // Track the instance
        isAutoPayerInstance[proxy] = true;
        userInstances[msg.sender].push(proxy);
        userInstances[_instanceOwner].push(proxy);
        allInstances.push(proxy);
        creatorCount[msg.sender]++;
        
        // Transfer creation fee
        if (msg.value > 0) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit AutoPayerCreated(
            msg.sender, 
            proxy, 
            autoPayerImplementation, 
            _instanceFeeRecipient, 
            allInstances.length
        );
        
        return proxy;
    }
    
    /**
     * @dev Create a self-owned AutoPayer instance
     * @return proxy Address of the new AutoPayer proxy
     */
    function createSelfOwnedInstance() external payable returns (address proxy) {
        return this.createAutoPayerInstance{value: msg.value}(msg.sender, msg.sender);
    }
    
    /**
     * @dev Upgrade all instances to a new implementation (ProxyAdmin only)
     * @param _newImplementation New implementation contract address
     */
    function upgradeAllInstances(address _newImplementation) 
        external 
        onlyRole(MANAGER_ADMIN_ROLE) 
    {
        require(_newImplementation != address(0), "Invalid implementation");
        address oldImplementation = autoPayerImplementation;
        autoPayerImplementation = _newImplementation;
        
        // Upgrade all existing instances
        for (uint256 i = 0; i < allInstances.length; i++) {
            try proxyAdmin.upgradeAndCall(
                ITransparentUpgradeableProxy(allInstances[i]),
                _newImplementation,
                abi.encodeWithSignature("upgradeVersion()")
            ) {
                // Success
            } catch {
                // Ignore failed upgrades
            }
        }
        
        emit ImplementationUpdated(oldImplementation, _newImplementation);
    }
    
    /**
     * @dev Upgrade a single instance (ProxyAdmin only)
     * @param _proxy Proxy address to upgrade
     * @param _newImplementation New implementation contract address
     */
    function upgradeSingleInstance(address _proxy, address _newImplementation) 
        external 
        onlyRole(MANAGER_ADMIN_ROLE) 
    {
        require(isAutoPayerInstance[_proxy], "Not a valid instance");
        require(_newImplementation != address(0), "Invalid implementation");
        
        proxyAdmin.upgradeAndCall(
            ITransparentUpgradeableProxy(_proxy),
            _newImplementation,
            abi.encodeWithSignature("upgradeVersion()")
        );
    }
    
    /**
     * @dev Authorize or deauthorize a creator
     * @param _creator Creator address
     * @param _authorized Whether creator is authorized
     * @param _limit Maximum instances for this creator
     */
    function setCreatorAuthorization(
        address _creator,
        bool _authorized,
        uint256 _limit
    ) external onlyRole(MANAGER_ADMIN_ROLE) {
        authorizedCreators[_creator] = _authorized;
        if (_authorized) {
            creatorLimit[_creator] = _limit;
            _grantRole(CREATOR_ROLE, _creator);
        } else {
            _revokeRole(CREATOR_ROLE, _creator);
        }
        
        emit CreatorAuthorized(_creator, _authorized, _limit);
    }
    
    /**
     * @dev Update the AutoPayer implementation template
     * @param _newImplementation New implementation contract address
     */
    function setAutoPayerImplementation(address _newImplementation) 
        external 
        onlyRole(MANAGER_ADMIN_ROLE) 
    {
        require(_newImplementation != address(0), "Invalid implementation");
        address oldImplementation = autoPayerImplementation;
        autoPayerImplementation = _newImplementation;
        emit ImplementationUpdated(oldImplementation, _newImplementation);
    }
    
    /**
     * @dev Update the oracle contract
     * @param _newOracle New oracle contract address
     */
    function setOracle(address _newOracle) 
        external 
        onlyRole(MANAGER_ADMIN_ROLE) 
    {
        require(_newOracle != address(0), "Invalid oracle");
        address oldOracle = address(oracle);
        oracle = AutoPayerOracle(_newOracle);
        emit OracleUpdated(oldOracle, _newOracle);
    }
    
    /**
     * @dev Set creation fees
     * @param _creationFee Fee to create new instance (in wei)
     * @param _creatorCommission Commission for creators (basis points)
     */
    function setFees(uint256 _creationFee, uint256 _creatorCommission) 
        external 
        onlyRole(MANAGER_ADMIN_ROLE) 
    {
        require(_creatorCommission <= 10000, "Commission too high");
        creationFee = _creationFee;
        creatorCommission = _creatorCommission;
        emit FeesUpdated(_creationFee, _creatorCommission);
    }
    
    /**
     * @dev Set instance limits
     * @param _maxPerCreator Maximum instances per creator
     * @param _totalLimit Total instance limit
     */
    function setInstanceLimits(uint256 _maxPerCreator, uint256 _totalLimit) 
        external 
        onlyRole(MANAGER_ADMIN_ROLE) 
    {
        maxInstancesPerCreator = _maxPerCreator;
        totalInstanceLimit = _totalLimit;
    }
    
    /**
     * @dev Set fee recipient
     * @param _feeRecipient New fee recipient
     */
    function setFeeRecipient(address _feeRecipient) 
        external 
        onlyRole(MANAGER_ADMIN_ROLE) 
    {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Add verifier to all instances (emergency function)
     * @param _verifier Verifier address
     */
    function addGlobalVerifier(address _verifier) 
        external 
        onlyRole(MANAGER_ADMIN_ROLE) 
    {
        _grantRole(VERIFIER_ROLE, _verifier);
        
        // Add to all existing instances
        for (uint256 i = 0; i < allInstances.length; i++) {
            try AutoPayerImplementation(allInstances[i]).managerAddVerifier(_verifier) {
                // Success
            } catch {
                // Ignore failed additions
            }
        }
    }
    
    /**
     * @dev Remove verifier from all instances (emergency function)
     * @param _verifier Verifier address
     */
    function removeGlobalVerifier(address _verifier) 
        external 
        onlyRole(MANAGER_ADMIN_ROLE) 
    {
        _revokeRole(VERIFIER_ROLE, _verifier);
        
        // Remove from all existing instances
        for (uint256 i = 0; i < allInstances.length; i++) {
            try AutoPayerImplementation(allInstances[i]).managerRemoveVerifier(_verifier) {
                // Success
            } catch {
                // Ignore failed removals
            }
        }
    }
    
    /**
     * @dev Pause all instances (emergency function)
     */
    function pauseAllInstances() external onlyRole(MANAGER_ADMIN_ROLE) {
        for (uint256 i = 0; i < allInstances.length; i++) {
            try AutoPayerImplementation(allInstances[i]).managerPause() {
                // Success
            } catch {
                // Ignore failed pauses
            }
        }
    }
    
    /**
     * @dev Unpause all instances
     */
    function unpauseAllInstances() external onlyRole(MANAGER_ADMIN_ROLE) {
        for (uint256 i = 0; i < allInstances.length; i++) {
            try AutoPayerImplementation(allInstances[i]).managerUnpause() {
                // Success
            } catch {
                // Ignore failed unpauses
            }
        }
    }
    
    // View functions
    function getUserInstances(address _user) external view returns (address[] memory) {
        return userInstances[_user];
    }
    
    function getAllInstances() external view returns (address[] memory) {
        return allInstances;
    }
    
    function getInstanceCount() external view returns (uint256) {
        return allInstances.length;
    }
    
    function getCreatorInfo(address _creator) external view returns (
        bool authorized,
        uint256 limit,
        uint256 count,
        address[] memory instances
    ) {
        return (
            authorizedCreators[_creator],
            creatorLimit[_creator],
            creatorCount[_creator],
            userInstances[_creator]
        );
    }
    
    /**
     * @dev Check if caller can create instances
     */
    function canCreateInstance(address _creator) external view returns (bool) {
        return authorizedCreators[_creator] && 
               creatorCount[_creator] < creatorLimit[_creator] &&
               allInstances.length < totalInstanceLimit;
    }
    
    /**
     * @dev Get proxy admin address
     */
    function getProxyAdmin() external view returns (address) {
        return address(proxyAdmin);
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(MANAGER_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(MANAGER_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Withdraw accumulated fees
     */
    function withdrawFees() external onlyRole(MANAGER_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(feeRecipient).transfer(balance);
        }
    }
    
    receive() external payable {}
} 