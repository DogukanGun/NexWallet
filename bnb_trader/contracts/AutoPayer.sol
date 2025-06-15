// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AutoPayer - Trustless P2P Bank Transfer Facilitator
 * @dev Escrow contract for facilitating fiat-to-crypto P2P transactions
 */
contract AutoPayer is ReentrancyGuard, Ownable, Pausable {
    
    // Structs
    struct EscrowRequest {
        uint256 id;
        address requester;          // Alice - who wants to receive fiat
        address payer;              // Bob - who will send fiat and receive crypto
        address tokenAddress;       // Crypto token address (USDT, etc.)
        uint256 tokenAmount;        // Amount of crypto tokens
        uint256 fiatAmount;         // Amount of fiat (in cents to avoid decimals)
        string fiatCurrency;        // "EUR", "USD", etc.
        string bankDetails;         // IBAN or bank account details (encrypted/hashed)
        string description;         // "Rent payment", "Invoice #123", etc.
        string receiptRequirements; // What the AI should look for in payment proof
        bytes32 receiptHash;        // Hash of the bank transfer receipt
        EscrowStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        uint256 paidAt;
        bool disputed;
    }
    
    enum EscrowStatus {
        Open,           // Request created, waiting for payer
        Accepted,       // Payer accepted, waiting for bank transfer
        ReceiptSubmitted, // Receipt submitted, waiting for verification
        Completed,      // Verified and funds released
        Cancelled,      // Cancelled by requester
        Refunded,       // Dispute resolved - refunded to requester
        Disputed        // Under dispute resolution
    }
    
    // State variables
    mapping(uint256 => EscrowRequest) public escrowRequests;
    mapping(address => uint256[]) public userRequests;
    mapping(address => uint256[]) public userPayments;
    mapping(address => bool) public verifiers;
    mapping(address => bool) public supportedTokens;
    
    uint256 public nextRequestId = 1;
    uint256 public platformFeeRate = 100; // 1% (basis points: 100 = 1%)
    uint256 public constant MAX_FEE_RATE = 1000; // 10% maximum
    uint256 public constant ESCROW_DURATION = 7 days;
    uint256 public constant VERIFICATION_TIMEOUT = 24 hours;
    
    address public feeRecipient;
    
    // Events
    event EscrowCreated(
        uint256 indexed requestId,
        address indexed requester,
        address tokenAddress,
        uint256 tokenAmount,
        uint256 fiatAmount,
        string fiatCurrency,
        string receiptRequirements
    );
    
    event EscrowAccepted(
        uint256 indexed requestId,
        address indexed payer
    );
    
    event ReceiptSubmitted(
        uint256 indexed requestId,
        bytes32 receiptHash,
        address indexed submitter
    );
    
    event EscrowCompleted(
        uint256 indexed requestId,
        address indexed requester,
        address indexed payer,
        uint256 tokenAmount
    );
    
    event EscrowCancelled(uint256 indexed requestId);
    event EscrowRefunded(uint256 indexed requestId);
    event DisputeRaised(uint256 indexed requestId, address indexed disputeRaiser);
    event DisputeResolved(uint256 indexed requestId, bool payerWins);
    
    // Modifiers
    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }
    
    modifier requestExists(uint256 _requestId) {
        require(_requestId < nextRequestId && _requestId > 0, "Request does not exist");
        _;
    }
    
    modifier onlyRequester(uint256 _requestId) {
        require(escrowRequests[_requestId].requester == msg.sender, "Not the requester");
        _;
    }
    
    modifier onlyPayer(uint256 _requestId) {
        require(escrowRequests[_requestId].payer == msg.sender, "Not the payer");
        _;
    }
    
    modifier onlyParties(uint256 _requestId) {
        require(
            escrowRequests[_requestId].requester == msg.sender || 
            escrowRequests[_requestId].payer == msg.sender,
            "Not a party to this escrow"
        );
        _;
    }
    
    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
        verifiers[msg.sender] = true;
    }
    
    /**
     * @dev Create a new escrow request with AI verification requirements
     * @param _tokenAddress Address of the ERC20 token to escrow
     * @param _tokenAmount Amount of tokens to escrow
     * @param _fiatAmount Amount of fiat currency expected (in cents)
     * @param _fiatCurrency Currency code (e.g., "EUR", "USD")
     * @param _bankDetails Bank account details (IBAN, etc.) - should be encrypted client-side
     * @param _description Description of the payment
     * @param _receiptRequirements Detailed requirements for payment proof that AI will verify
     */
    function createEscrowRequest(
        address _tokenAddress,
        uint256 _tokenAmount,
        uint256 _fiatAmount,
        string memory _fiatCurrency,
        string memory _bankDetails,
        string memory _description,
        string memory _receiptRequirements
    ) external nonReentrant whenNotPaused {
        require(supportedTokens[_tokenAddress], "Token not supported");
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        require(_fiatAmount > 0, "Fiat amount must be greater than 0");
        require(bytes(_fiatCurrency).length > 0, "Currency required");
        require(bytes(_bankDetails).length > 0, "Bank details required");
        require(bytes(_receiptRequirements).length > 0, "Receipt requirements required for AI verification");
        
        // Transfer tokens to this contract
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _tokenAmount);
        
        uint256 requestId = nextRequestId++;
        
        escrowRequests[requestId] = EscrowRequest({
            id: requestId,
            requester: msg.sender,
            payer: address(0),
            tokenAddress: _tokenAddress,
            tokenAmount: _tokenAmount,
            fiatAmount: _fiatAmount,
            fiatCurrency: _fiatCurrency,
            bankDetails: _bankDetails,
            description: _description,
            receiptRequirements: _receiptRequirements,
            receiptHash: bytes32(0),
            status: EscrowStatus.Open,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + ESCROW_DURATION,
            paidAt: 0,
            disputed: false
        });
        
        userRequests[msg.sender].push(requestId);
        
        emit EscrowCreated(
            requestId,
            msg.sender,
            _tokenAddress,
            _tokenAmount,
            _fiatAmount,
            _fiatCurrency,
            _receiptRequirements
        );
    }
    
    /**
     * @dev Accept an escrow request (Bob accepts Alice's request)
     * @param _requestId ID of the escrow request
     */
    function acceptEscrowRequest(uint256 _requestId) 
        external 
        requestExists(_requestId) 
        nonReentrant 
        whenNotPaused 
    {
        EscrowRequest storage request = escrowRequests[_requestId];
        
        require(request.status == EscrowStatus.Open, "Request not available");
        require(request.requester != msg.sender, "Cannot accept own request");
        require(block.timestamp <= request.expiresAt, "Request expired");
        
        request.payer = msg.sender;
        request.status = EscrowStatus.Accepted;
        
        userPayments[msg.sender].push(_requestId);
        
        emit EscrowAccepted(_requestId, msg.sender);
    }
    
    /**
     * @dev Submit proof of bank transfer (Bob submits receipt)
     * @param _requestId ID of the escrow request
     * @param _receiptHash Hash of the bank transfer receipt/proof
     */
    function submitReceipt(uint256 _requestId, bytes32 _receiptHash) 
        external 
        requestExists(_requestId) 
        onlyPayer(_requestId) 
        nonReentrant 
        whenNotPaused 
    {
        EscrowRequest storage request = escrowRequests[_requestId];
        
        require(request.status == EscrowStatus.Accepted, "Invalid status for receipt submission");
        require(_receiptHash != bytes32(0), "Invalid receipt hash");
        require(block.timestamp <= request.expiresAt, "Request expired");
        
        request.receiptHash = _receiptHash;
        request.status = EscrowStatus.ReceiptSubmitted;
        request.paidAt = block.timestamp;
        
        emit ReceiptSubmitted(_requestId, _receiptHash, msg.sender);
    }
    
    /**
     * @dev Verify receipt and release funds (called by AI verifier or admin)
     * @param _requestId ID of the escrow request
     * @param _approved Whether the receipt is verified and approved
     */
    function verifyAndRelease(uint256 _requestId, bool _approved) 
        external 
        requestExists(_requestId) 
        onlyVerifier 
        nonReentrant 
    {
        EscrowRequest storage request = escrowRequests[_requestId];
        
        require(request.status == EscrowStatus.ReceiptSubmitted, "No receipt to verify");
        require(!request.disputed, "Request is disputed");
        
        if (_approved) {
            // Calculate platform fee
            uint256 platformFee = (request.tokenAmount * platformFeeRate) / 10000;
            uint256 payerAmount = request.tokenAmount - platformFee;
            
            // Transfer tokens to payer (Bob)
            IERC20(request.tokenAddress).transfer(request.payer, payerAmount);
            
            // Transfer platform fee
            if (platformFee > 0) {
                IERC20(request.tokenAddress).transfer(feeRecipient, platformFee);
            }
            
            request.status = EscrowStatus.Completed;
            
            emit EscrowCompleted(_requestId, request.requester, request.payer, payerAmount);
        } else {
            // Receipt not verified - refund to requester
            IERC20(request.tokenAddress).transfer(request.requester, request.tokenAmount);
            request.status = EscrowStatus.Refunded;
            
            emit EscrowRefunded(_requestId);
        }
    }
    
    /**
     * @dev Raise a dispute (can be called by either party)
     * @param _requestId ID of the escrow request
     */
    function raiseDispute(uint256 _requestId) 
        external 
        requestExists(_requestId) 
        onlyParties(_requestId) 
        nonReentrant 
    {
        EscrowRequest storage request = escrowRequests[_requestId];
        
        require(
            request.status == EscrowStatus.Accepted || 
            request.status == EscrowStatus.ReceiptSubmitted,
            "Cannot dispute at this stage"
        );
        require(!request.disputed, "Already disputed");
        
        request.disputed = true;
        request.status = EscrowStatus.Disputed;
        
        emit DisputeRaised(_requestId, msg.sender);
    }
    
    /**
     * @dev Resolve dispute (admin/verifier only)
     * @param _requestId ID of the escrow request
     * @param _payerWins Whether the payer (Bob) wins the dispute
     */
    function resolveDispute(uint256 _requestId, bool _payerWins) 
        external 
        requestExists(_requestId) 
        onlyVerifier 
        nonReentrant 
    {
        EscrowRequest storage request = escrowRequests[_requestId];
        
        require(request.status == EscrowStatus.Disputed, "Not disputed");
        
        if (_payerWins) {
            // Payer gets the tokens (minus fee)
            uint256 platformFee = (request.tokenAmount * platformFeeRate) / 10000;
            uint256 payerAmount = request.tokenAmount - platformFee;
            
            IERC20(request.tokenAddress).transfer(request.payer, payerAmount);
            if (platformFee > 0) {
                IERC20(request.tokenAddress).transfer(feeRecipient, platformFee);
            }
            
            request.status = EscrowStatus.Completed;
        } else {
            // Requester gets refunded
            IERC20(request.tokenAddress).transfer(request.requester, request.tokenAmount);
            request.status = EscrowStatus.Refunded;
        }
        
        emit DisputeResolved(_requestId, _payerWins);
    }
    
    /**
     * @dev Cancel an open escrow request (requester only)
     * @param _requestId ID of the escrow request
     */
    function cancelRequest(uint256 _requestId) 
        external 
        requestExists(_requestId) 
        onlyRequester(_requestId) 
        nonReentrant 
    {
        EscrowRequest storage request = escrowRequests[_requestId];
        
        require(request.status == EscrowStatus.Open, "Cannot cancel at this stage");
        
        // Refund tokens to requester
        IERC20(request.tokenAddress).transfer(request.requester, request.tokenAmount);
        
        request.status = EscrowStatus.Cancelled;
        
        emit EscrowCancelled(_requestId);
    }
    
    /**
     * @dev Handle expired requests (can be called by anyone)
     * @param _requestId ID of the escrow request
     */
    function handleExpiredRequest(uint256 _requestId) 
        external 
        requestExists(_requestId) 
        nonReentrant 
    {
        EscrowRequest storage request = escrowRequests[_requestId];
        
        require(block.timestamp > request.expiresAt, "Request not expired");
        require(
            request.status == EscrowStatus.Open || 
            request.status == EscrowStatus.Accepted,
            "Cannot expire at this stage"
        );
        
        // Refund tokens to requester
        IERC20(request.tokenAddress).transfer(request.requester, request.tokenAmount);
        
        request.status = EscrowStatus.Cancelled;
        
        emit EscrowCancelled(_requestId);
    }
    
    /**
     * @dev Get receipt requirements for a specific escrow request
     * @param _requestId ID of the escrow request
     * @return receiptRequirements The requirements string for AI verification
     */
    function getReceiptRequirements(uint256 _requestId) 
        external 
        view 
        requestExists(_requestId) 
        returns (string memory) 
    {
        return escrowRequests[_requestId].receiptRequirements;
    }
    
    /**
     * @dev Get escrow request details including receipt requirements
     * @param _requestId ID of the escrow request
     * @return request The complete escrow request struct
     */
    function getEscrowRequest(uint256 _requestId) 
        external 
        view 
        requestExists(_requestId) 
        returns (EscrowRequest memory) 
    {
        return escrowRequests[_requestId];
    }
    
    function getUserRequests(address _user) external view returns (uint256[] memory) {
        return userRequests[_user];
    }
    
    function getUserPayments(address _user) external view returns (uint256[] memory) {
        return userPayments[_user];
    }
    
    function getActiveRequests() external view returns (uint256[] memory) {
        uint256[] memory active = new uint256[](nextRequestId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextRequestId; i++) {
            if (escrowRequests[i].status == EscrowStatus.Open) {
                active[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = active[i];
        }
        
        return result;
    }
    
    // Admin functions
    function addVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = true;
    }
    
    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
    }
    
    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }
    
    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
    }
    
    function setPlatformFeeRate(uint256 _feeRate) external onlyOwner {
        require(_feeRate <= MAX_FEE_RATE, "Fee rate too high");
        platformFeeRate = _feeRate;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency function to withdraw stuck tokens (admin only)
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
} 