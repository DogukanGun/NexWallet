package com.dag.nexwallet.features.bnb.presentation

import android.net.Uri
import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.BuildConfig
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.base.components.bottomnav.BottomNavMessageManager
import com.dag.nexwallet.base.scroll.ScrollStateManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BnbVM @Inject constructor(
    scrollManager: ScrollStateManager,
    private val bottomNavManager: BottomNavMessageManager
) : BaseVM<BnbVS>(BnbVS.Loading) {

    init {
        initializeAutoPayerApp()
        scrollManager.updateScrolling(true)
    }

    private fun initializeAutoPayerApp() {
        val isBuild = BuildConfig.DEBUG
        viewModelScope.launch {
            try {
                bottomNavManager.showMessage("AutoPayer")
                _viewState.value = BnbVS.Success(
                    walletInfo = BnbVS.WalletInfo(
                        address = "0x1234...5678",
                        balance = "0.50"
                    ),
                    demoModeOn = isBuild,
                    myRequests = if (isBuild) getDummyMyRequests() else emptyList(),
                    availableRequests = if (isBuild) getDummyAvailableRequests() else emptyList(),
                    myPayments = if (isBuild) getDummyMyPayments() else emptyList()
                )
            } catch (e: Exception) {
                _viewState.value = BnbVS.Error(e.message ?: "Failed to initialize AutoPayer")
            }
        }
    }

    private fun getDummyMyRequests(): List<BnbVS.EscrowRequest> {
        return listOf(
            BnbVS.EscrowRequest(
                id = "req_001",
                requesterAddress = "0x1234...5678",
                tokenAmount = "150",
                tokenSymbol = "USDT",
                fiatAmount = "150",
                fiatCurrency = "EUR",
                description = "Rent payment for apartment",
                receiptRequirements = "Bank transfer screenshot showing: €150 transfer, recipient IBAN matching DE89370400440532013000, transfer date, sender bank details visible",
                status = BnbVS.EscrowStatus.OPEN,
                createdAt = System.currentTimeMillis() - 3600000 // 1 hour ago
            ),
            BnbVS.EscrowRequest(
                id = "req_002",
                requesterAddress = "0x1234...5678",
                payerAddress = "0x9876...4321",
                tokenAmount = "100",
                tokenSymbol = "USDT",
                fiatAmount = "100",
                fiatCurrency = "EUR",
                description = "Freelance payment",
                receiptRequirements = "Banking app screenshot or bank statement showing €100 payment to IBAN: NL91ABNA0417164300, payment reference must include 'Freelance Invoice #123'",
                status = BnbVS.EscrowStatus.ACCEPTED,
                createdAt = System.currentTimeMillis() - 7200000 // 2 hours ago
            )
        )
    }

    private fun getDummyAvailableRequests(): List<BnbVS.EscrowRequest> {
        return listOf(
            BnbVS.EscrowRequest(
                id = "req_003",
                requesterAddress = "0xabcd...efgh",
                tokenAmount = "200",
                tokenSymbol = "USDT",
                fiatAmount = "200",
                fiatCurrency = "EUR",
                description = "Invoice payment for services",
                receiptRequirements = "Clear bank transfer proof showing €200 payment to business account IBAN: FR1420041010050500013M02606, must include invoice reference #INV-2024-001",
                status = BnbVS.EscrowStatus.OPEN,
                createdAt = System.currentTimeMillis() - 1800000 // 30 min ago
            ),
            BnbVS.EscrowRequest(
                id = "req_004",
                requesterAddress = "0x5555...7777",
                tokenAmount = "75",
                tokenSymbol = "USDT",
                fiatAmount = "75",
                fiatCurrency = "EUR",
                description = "Online purchase payment",
                receiptRequirements = "Mobile banking screenshot showing €75 transfer, recipient name 'John Smith', IBAN visible, transaction timestamp within last 24 hours",
                status = BnbVS.EscrowStatus.OPEN,
                createdAt = System.currentTimeMillis() - 900000 // 15 min ago
            )
        )
    }

    private fun getDummyMyPayments(): List<BnbVS.EscrowRequest> {
        return listOf(
            BnbVS.EscrowRequest(
                id = "req_005",
                requesterAddress = "0x8888...9999",
                payerAddress = "0x1234...5678",
                tokenAmount = "120",
                tokenSymbol = "USDT",
                fiatAmount = "120",
                fiatCurrency = "EUR",
                description = "Marketplace purchase",
                receiptRequirements = "Bank app screenshot showing €120 payment to seller, IBAN ending in 1234, payment description must include 'Marketplace Order #MP789'",
                status = BnbVS.EscrowStatus.ACCEPTED,
                createdAt = System.currentTimeMillis() - 5400000 // 1.5 hours ago
            )
        )
    }

    fun toggleMode() {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success) {
            val newMode = when (currentState.currentMode) {
                BnbVS.Mode.MY_REQUESTS -> BnbVS.Mode.BROWSE_REQUESTS
                BnbVS.Mode.BROWSE_REQUESTS -> BnbVS.Mode.MY_PAYMENTS
                BnbVS.Mode.MY_PAYMENTS -> BnbVS.Mode.MY_REQUESTS
            }
            _viewState.value = currentState.copy(currentMode = newMode)
        }
    }

    fun switchToMode(mode: BnbVS.Mode) {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success && currentState.currentMode != mode) {
            _viewState.value = currentState.copy(currentMode = mode)
        }
    }

    fun showCreateDialog() {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success) {
            _viewState.value = currentState.copy(showCreateDialog = true)
        }
    }

    fun hideCreateDialog() {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success) {
            _viewState.value = currentState.copy(showCreateDialog = false)
        }
    }

    fun showPayDialog() {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success) {
            _viewState.value = currentState.copy(showPayDialog = true)
        }
    }

    fun hidePayDialog() {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success) {
            _viewState.value = currentState.copy(showPayDialog = false)
        }
    }

    fun createEscrowRequest(request: BnbVS.CreateEscrowRequest) {
        viewModelScope.launch {
            try {
                val currentState = _viewState.value
                if (currentState is BnbVS.Success) {
                    // TODO: Integrate with smart contract createEscrowRequest function
                    val newEscrowRequest = BnbVS.EscrowRequest(
                        tokenAddress = request.tokenAddress,
                        tokenAmount = request.tokenAmount,
                        fiatAmount = request.fiatAmount,
                        fiatCurrency = request.fiatCurrency,
                        bankDetails = request.bankDetails,
                        description = request.description,
                        receiptRequirements = request.receiptRequirements,
                        requesterAddress = currentState.walletInfo.address
                    )
                    
                    val updatedRequests = currentState.myRequests + newEscrowRequest
                    _viewState.value = currentState.copy(
                        myRequests = updatedRequests,
                        currentMode = BnbVS.Mode.MY_REQUESTS
                    )
                    
                    bottomNavManager.showMessage("Escrow request created successfully")
                }
            } catch (e: Exception) {
                handleError("Failed to create escrow request: ${e.message}")
            }
        }
    }

    fun shareRequest(requestId: String) {
        viewModelScope.launch {
            try {
                val currentState = _viewState.value
                if (currentState is BnbVS.Success) {
                    val request = currentState.myRequests.find { it.id == requestId }
                    if (request != null) {
                        // TODO: Generate actual smart contract address for this request
                        val contractAddress = "0x${requestId.takeLast(8)}...${requestId.take(8)}"
                        
                        // TODO: Integrate with Android sharing intent
                        bottomNavManager.showMessage("Share contract address: $contractAddress")
                    }
                }
            } catch (e: Exception) {
                handleError("Failed to share request: ${e.message}")
            }
        }
    }

    fun processPayment(contractAddress: String, fileUri: Uri?) {
        viewModelScope.launch {
            try {
                if (fileUri == null) {
                    handleError("Please select a receipt file")
                    return@launch
                }
                
                bottomNavManager.showMessage("Uploading receipt...")
                
                // Upload file to storage (IPFS/cloud)
                val uploadedFileUrl = uploadReceiptFile(fileUri)
                
                bottomNavManager.showMessage("Submitting payment proof...")
                
                // Submit to backend - backend will handle AI verification and smart contract interaction
                val submissionResult = submitPaymentProof(contractAddress, uploadedFileUrl, fileUri)
                
                if (submissionResult.success) {
                    bottomNavManager.showMessage("Payment proof submitted successfully! Verification in progress...")
                } else {
                    bottomNavManager.showMessage("Failed to submit payment proof: ${submissionResult.error}")
                }
                
            } catch (e: Exception) {
                handleError("Failed to process payment: ${e.message}")
            }
        }
    }

    private suspend fun uploadReceiptFile(fileUri: Uri): String {
        // TODO: Implement actual file upload to IPFS/cloud storage
        // For now, simulate upload delay
        kotlinx.coroutines.delay(1000)
        return "ipfs://QmYourFileHashHere" // Mock IPFS URL
    }

    private suspend fun submitPaymentProof(contractAddress: String, fileUrl: String, fileUri: Uri): SubmissionResult {
        // TODO: Submit to backend API endpoint
        // Backend will:
        // 1. Fetch escrow details from smart contract
        // 2. Download file from IPFS/storage
        // 3. Run AI verification against receipt requirements
        // 4. Submit result to smart contract
        // 5. Return status to mobile app
        
        // For now, simulate API call
        kotlinx.coroutines.delay(1500)
        return SubmissionResult(
            success = true,
            transactionHash = "0x1234567890abcdef",
            error = ""
        )
    }

    private suspend fun fetchEscrowDetails(contractAddress: String): BnbVS.EscrowRequest? {
        // TODO: This might not be needed since backend will handle it
        // But could be useful for displaying escrow details before payment
        kotlinx.coroutines.delay(500)
        return null // Mock response
    }

    fun acceptEscrowRequest(requestId: String) {
        viewModelScope.launch {
            try {
                val currentState = _viewState.value
                if (currentState is BnbVS.Success) {
                    // TODO: Integrate with smart contract acceptEscrowRequest function
                    val updatedAvailableRequests = currentState.availableRequests.map { request ->
                        if (request.id == requestId) {
                            request.copy(
                                status = BnbVS.EscrowStatus.ACCEPTED,
                                payerAddress = currentState.walletInfo.address
                            )
                        } else request
                    }
                    
                    val acceptedRequest = updatedAvailableRequests.find { it.id == requestId }
                    val updatedMyPayments = if (acceptedRequest != null) {
                        currentState.myPayments + acceptedRequest
                    } else currentState.myPayments
                    
                    val filteredAvailableRequests = updatedAvailableRequests.filter { it.id != requestId }
                    
                    _viewState.value = currentState.copy(
                        availableRequests = filteredAvailableRequests,
                        myPayments = updatedMyPayments,
                        currentMode = BnbVS.Mode.MY_PAYMENTS
                    )
                    
                    bottomNavManager.showMessage("Escrow request accepted")
                }
            } catch (e: Exception) {
                handleError("Failed to accept request: ${e.message}")
            }
        }
    }

    fun submitReceipt(requestId: String, receiptHash: String) {
        viewModelScope.launch {
            try {
                val currentState = _viewState.value
                if (currentState is BnbVS.Success) {
                    // TODO: Integrate with smart contract submitReceipt function
                    val updatedMyPayments = currentState.myPayments.map { request ->
                        if (request.id == requestId) {
                            request.copy(
                                status = BnbVS.EscrowStatus.RECEIPT_SUBMITTED,
                                receiptHash = receiptHash,
                                paidAt = System.currentTimeMillis()
                            )
                        } else request
                    }
                    
                    _viewState.value = currentState.copy(myPayments = updatedMyPayments)
                    bottomNavManager.showMessage("Receipt submitted for verification")
                }
            } catch (e: Exception) {
                handleError("Failed to submit receipt: ${e.message}")
            }
        }
    }

    fun raiseDispute(requestId: String) {
        viewModelScope.launch {
            try {
                val currentState = _viewState.value
                if (currentState is BnbVS.Success) {
                    // TODO: Integrate with smart contract raiseDispute function
                    val updatedMyRequests = currentState.myRequests.map { request ->
                        if (request.id == requestId) {
                            request.copy(
                                status = BnbVS.EscrowStatus.DISPUTED,
                                isDisputed = true
                            )
                        } else request
                    }
                    
                    val updatedMyPayments = currentState.myPayments.map { request ->
                        if (request.id == requestId) {
                            request.copy(
                                status = BnbVS.EscrowStatus.DISPUTED,
                                isDisputed = true
                            )
                        } else request
                    }
                    
                    _viewState.value = currentState.copy(
                        myRequests = updatedMyRequests,
                        myPayments = updatedMyPayments
                    )
                    
                    bottomNavManager.showMessage("Dispute raised successfully")
                }
            } catch (e: Exception) {
                handleError("Failed to raise dispute: ${e.message}")
            }
        }
    }

    fun refreshData() {
        viewModelScope.launch {
            try {
                // TODO: Refresh data from smart contract
                // For now, just simulate refresh
                val currentState = _viewState.value
                if (currentState is BnbVS.Success) {
                    _viewState.value = currentState.copy(
                        availableRequests = getDummyAvailableRequests()
                    )
                    bottomNavManager.showMessage("Data refreshed")
                }
            } catch (e: Exception) {
                handleError("Failed to refresh data: ${e.message}")
            }
        }
    }

    private fun handleError(errorMessage: String) {
        _viewState.value = BnbVS.Error(errorMessage)
        viewModelScope.launch {
            bottomNavManager.showMessage(errorMessage)
        }
    }

    fun refreshApp() {
        _viewState.value = BnbVS.Loading
        initializeAutoPayerApp()
    }

    // Helper data class for backend submission result
    private data class SubmissionResult(
        val success: Boolean,
        val transactionHash: String = "",
        val error: String = ""
    )
}