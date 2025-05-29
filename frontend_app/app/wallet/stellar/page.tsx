'use client'

import { useState } from 'react'
import { useTheme } from '@/store/ThemeContext'
import Header from '../../app/components/Header'
import { FaWallet, FaRegPaperPlane, FaRobot, FaSyncAlt, FaRegCopy } from 'react-icons/fa'
import { createOrGetWallet, getWalletBalance, buildPaymentTransaction, buildTrustlineTransaction, buildRemoveTrustlineTransaction } from './api.stellar'
import { Transaction, Keypair, Networks, TransactionBuilder } from 'stellar-sdk';

const assets = [
  { code: 'XLM', issuer: '', name: 'Stellar Lumens (XLM)' },
  { code: 'USDC', issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', name: 'USD Coin (USDC)' },
  { code: 'EURC', issuer: 'GDQOE23CFSUMSVQK4Y5JHPPYK73VYCNHZHA7ENKCV37P6SUEO6XQBKPP', name: 'Euro Coin (EURC)' },
  { code: 'yBTC', issuer: 'GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5', name: 'Wrapped Bitcoin (yBTC)' },
  { code: 'yETH', issuer: 'GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5', name: 'Wrapped Ethereum (yETH)' },
  { code: 'yUSDT', issuer: 'GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5', name: 'Tether USD (yUSDT)' },
];

export default function StellarAIWallet() {
  const { theme } = useTheme();
  const [publicKey, setPublicKey] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState(assets[0].code);
  const [status, setStatus] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: string, text: string}[]>([]);
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSecretPrompt, setShowSecretPrompt] = useState(false);
  const [pendingXDR, setPendingXDR] = useState('');
  const [userSecret, setUserSecret] = useState('');
  const [txHash, setTxHash] = useState('');
  const [trustAsset, setTrustAsset] = useState(assets[1].code);
  const [trustIssuer, setTrustIssuer] = useState(assets[1].issuer);
  const [showTrustPrompt, setShowTrustPrompt] = useState(false);
  const [pendingTrustXDR, setPendingTrustXDR] = useState('');
  const [trustSecret, setTrustSecret] = useState('');
  const [showRemoveTrustPrompt, setShowRemoveTrustPrompt] = useState(false);
  const [pendingRemoveTrustXDR, setPendingRemoveTrustXDR] = useState('');
  const [removeTrustSecret, setRemoveTrustSecret] = useState('');
  const [selectedAssetToRemove, setSelectedAssetToRemove] = useState('');

  // Use a hardcoded twitterId for demo
  const twitterId = 'demo_user_123';

  const handleCreateWallet = async () => {
    setStatus('Creating wallet...');
    setLoading(true);
    try {
      const wallet = await createOrGetWallet(twitterId);
      setPublicKey(wallet.publicKey);
      setStatus(wallet.isNewWallet ? 'Wallet created!' : 'Wallet loaded!');
      // Fetch balance
      const balances = await getWalletBalance(wallet.publicKey);
      setBalance(balances);
    } catch (e: any) {
      setStatus('Error creating wallet: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    setStatus('Building payment transaction...');
    setLoading(true);
    try {
      const selectedAsset = assets.find(a => a.code === asset);
      const assetIssuer = selectedAsset?.issuer || undefined;
      const xdr = await buildPaymentTransaction(publicKey, recipient, amount, asset, assetIssuer);
      setPendingXDR(xdr);
      setShowSecretPrompt(true);
      setStatus('Please enter your secret key to sign and submit the transaction.');
    } catch (e: any) {
      setStatus('Error building payment: ' + (e.message || e.toString()));
      setLoading(false);
    }
  };

  const handleSignAndSubmit = async () => {
    setStatus('Signing and submitting transaction...');
    setLoading(true);
    try {
      const tx = TransactionBuilder.fromXDR(pendingXDR, Networks.TESTNET);
      const kp = Keypair.fromSecret(userSecret);
      tx.sign(kp);
      const xdrBase64 = tx.toEnvelope().toXDR('base64');
      const response = await fetch('https://horizon-testnet.stellar.org/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `tx=${encodeURIComponent(xdrBase64)}`,
      });
      if (!response.ok) throw new Error('Failed to submit transaction');
      const data = await response.json();
      setTxHash(data.hash);
      setStatus('Transaction submitted!');
      setShowSecretPrompt(false);
      setUserSecret('');
      setPendingXDR('');
      setTxHistory([{ to: recipient, amount, asset, date: new Date().toLocaleString(), hash: data.hash }, ...txHistory]);
      // Refresh balance
      const balances = await getWalletBalance(publicKey);
      setBalance(balances);
    } catch (e: any) {
      setStatus('Error signing/submitting: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  const handleAIChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setAiMessages([...aiMessages, { role: 'user', text: aiInput }]);
    setTimeout(() => {
      setAiMessages(msgs => [...msgs, { role: 'ai', text: 'AI: This is a smart response to: ' + aiInput }]);
    }, 900);
    setAiInput('');
  };

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleAddTrustline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    setStatus('Building trustline transaction...');
    setLoading(true);
    try {
      const xdr = await buildTrustlineTransaction(publicKey, trustAsset, trustIssuer);
      setPendingTrustXDR(xdr);
      setShowTrustPrompt(true);
      setStatus('Please enter your secret key to sign and submit the trustline transaction.');
    } catch (e: any) {
      setStatus('Error building trustline: ' + (e.message || e.toString()));
      setLoading(false);
    }
  };

  const handleSignAndSubmitTrust = async () => {
    setStatus('Signing and submitting trustline transaction...');
    setLoading(true);
    try {
      const tx = TransactionBuilder.fromXDR(pendingTrustXDR, Networks.TESTNET);
      const kp = Keypair.fromSecret(trustSecret);
      tx.sign(kp);
      const xdrBase64 = tx.toEnvelope().toXDR('base64');
      const response = await fetch('https://horizon-testnet.stellar.org/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `tx=${encodeURIComponent(xdrBase64)}`,
      });
      if (!response.ok) throw new Error('Failed to submit trustline transaction');
      setStatus('Trustline transaction submitted!');
      setShowTrustPrompt(false);
      setTrustSecret('');
      setPendingTrustXDR('');
      // Refresh balance
      const balances = await getWalletBalance(publicKey);
      setBalance(balances);
    } catch (e: any) {
      setStatus('Error signing/submitting trustline: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrustline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !selectedAssetToRemove) return;
    setStatus('Building remove trustline transaction...');
    setLoading(true);
    try {
      const selectedAsset = assets.find(a => a.code === selectedAssetToRemove);
      if (!selectedAsset) throw new Error('Asset not found');
      const xdr = await buildRemoveTrustlineTransaction(publicKey, selectedAsset.code, selectedAsset.issuer);
      setPendingRemoveTrustXDR(xdr);
      setShowRemoveTrustPrompt(true);
      setStatus('Please enter your secret key to sign and submit the remove trustline transaction.');
    } catch (e: any) {
      setStatus('Error building remove trustline: ' + (e.message || e.toString()));
      setLoading(false);
    }
  };

  const handleSignAndSubmitRemoveTrust = async () => {
    setStatus('Signing and submitting remove trustline transaction...');
    setLoading(true);
    try {
      const tx = TransactionBuilder.fromXDR(pendingRemoveTrustXDR, Networks.TESTNET);
      const kp = Keypair.fromSecret(removeTrustSecret);
      tx.sign(kp);
      const xdrBase64 = tx.toEnvelope().toXDR('base64');
      const response = await fetch('https://horizon-testnet.stellar.org/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `tx=${encodeURIComponent(xdrBase64)}`,
      });
      if (!response.ok) throw new Error('Failed to submit remove trustline transaction');
      setStatus('Trustline removed successfully!');
      setShowRemoveTrustPrompt(false);
      setRemoveTrustSecret('');
      setPendingRemoveTrustXDR('');
      setSelectedAssetToRemove('');
      // Refresh balance
      const balances = await getWalletBalance(publicKey);
      setBalance(balances);
    } catch (e: any) {
      setStatus('Error signing/submitting remove trustline: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white'
        : 'bg-gradient-to-br from-white via-purple-50 to-gray-100 text-gray-900'
      } page-with-navbar`}>
      <div className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Wallet Info Card */}
            <div className="flex-1 bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8 mb-8 md:mb-0 border border-purple-200 dark:border-purple-900">
              <div className="flex items-center mb-4">
                <FaWallet className="text-purple-500 text-2xl mr-2" />
                <h2 className="text-xl font-bold">Stellar AI Wallet</h2>
              </div>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Manage your Stellar wallet with AI. Create accounts, send payments, swap assets, and more.
              </p>
              <button
                className="w-full py-2 mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold shadow hover:from-purple-600 hover:to-indigo-600 transition"
                onClick={handleCreateWallet}
                disabled={loading}
              >
                <FaSyncAlt className="inline mr-2" /> {loading ? 'Loading...' : 'Create New Wallet'}
              </button>
              {publicKey && (
                <div className="mb-4">
                  <span className="font-semibold">Your Public Key:</span>
                  <div className="flex items-center mt-1 bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">
                    <span className="break-all flex-1">{publicKey}</span>
                    <button
                      className="ml-2 text-purple-500 hover:text-purple-700"
                      onClick={handleCopy}
                      title="Copy to clipboard"
                    >
                      <FaRegCopy />
                    </button>
                    {copied && <span className="ml-2 text-green-500 text-xs">Copied!</span>}
                  </div>
                  {balance.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Balances:</h4>
                      <ul>
                        {balance.map((b, i) => (
                          <li key={i}>{b.asset}: {b.balance}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <form onSubmit={handleSendPayment} className="flex flex-col gap-3 mt-4">
                <label className="font-semibold flex items-center"><FaRegPaperPlane className="mr-2" />Send Payment</label>
                <input
                  type="text"
                  placeholder="Recipient Public Key"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="p-2 rounded border"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="p-2 rounded border flex-1"
                    required
                  />
                  <select
                    value={asset}
                    onChange={e => setAsset(e.target.value)}
                    className="p-2 rounded border bg-white dark:bg-gray-900"
                  >
                    {assets.map(a => (
                      <option key={a.code} value={a.code}>{a.code}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold shadow hover:from-green-600 hover:to-emerald-600 transition"
                  disabled={!publicKey || loading}
                >
                  Send
                </button>
              </form>
              <form onSubmit={handleAddTrustline} className="flex flex-col gap-3 mt-4">
                <label className="font-semibold flex items-center">Add Trustline</label>
                <select
                  value={trustAsset}
                  onChange={e => {
                    setTrustAsset(e.target.value);
                    const selected = assets.find(a => a.code === e.target.value);
                    setTrustIssuer(selected?.issuer || '');
                  }}
                  className="p-2 rounded border bg-white dark:bg-gray-900"
                >
                  {assets.filter(a => a.issuer).map(a => (
                    <option key={a.code} value={a.code}>{a.code}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition"
                  disabled={!publicKey || loading}
                >
                  Add Trustline
                </button>
              </form>
              <form onSubmit={handleRemoveTrustline} className="flex flex-col gap-3 mt-4">
                <label className="font-semibold flex items-center">Remove Trustline</label>
                <select
                  value={selectedAssetToRemove}
                  onChange={e => setSelectedAssetToRemove(e.target.value)}
                  className="p-2 rounded border bg-white dark:bg-gray-900"
                >
                  <option value="">Select asset to remove</option>
                  {balance
                    .filter(b => b.asset !== 'XLM' && b.asset)
                    .map(b => (
                      <option key={b.asset} value={b.asset}>{b.asset}</option>
                    ))}
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold shadow hover:bg-red-600 transition"
                  disabled={!publicKey || !selectedAssetToRemove || loading}
                >
                  Remove Trustline
                </button>
              </form>
              {status && <div className="mt-4 text-purple-600 dark:text-purple-400">{status}</div>}
            </div>

            {/* AI Assistant Panel */}
            <div className="flex-1 bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8 border border-blue-200 dark:border-blue-900 flex flex-col">
              <div className="flex items-center mb-4">
                <FaRobot className="text-blue-500 text-2xl mr-2" />
                <h2 className="text-xl font-bold">AI Assistant</h2>
              </div>
              <div className="flex-1 overflow-y-auto mb-4 max-h-64">
                {aiMessages.length === 0 && (
                  <div className="text-gray-400 text-center mt-8">Ask anything about your Stellar wallet...</div>
                )}
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-xs ${msg.role === 'user' ? 'bg-purple-500 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAIChat} className="flex gap-2 mt-auto">
                <input
                  type="text"
                  placeholder="Ask the AI..."
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  className="p-2 rounded border flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 mt-8">
            <h3 className="text-lg font-bold mb-4 flex items-center"><FaSyncAlt className="mr-2 text-purple-500" />Transaction History</h3>
            {txHistory.length === 0 ? (
              <div className="text-gray-400">No transactions yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                    <th className="py-2">To</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Asset</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {txHistory.map((tx, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 break-all">{tx.to}</td>
                      <td className="py-2">{tx.amount}</td>
                      <td className="py-2">{tx.asset}</td>
                      <td className="py-2">{tx.date}</td>
                      <td className="py-2 break-all">
                        {tx.hash ? (
                          <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{tx.hash.slice(0, 8)}...</a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
      {showSecretPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl flex flex-col gap-4">
            <h3 className="font-bold text-lg">Sign Transaction</h3>
            <input
              type="password"
              placeholder="Enter your Stellar secret key"
              value={userSecret}
              onChange={e => setUserSecret(e.target.value)}
              className="p-2 rounded border"
            />
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleSignAndSubmit}
              disabled={loading || !userSecret}
            >
              Sign & Submit
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => setShowSecretPrompt(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showTrustPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl flex flex-col gap-4">
            <h3 className="font-bold text-lg">Sign Trustline Transaction</h3>
            <input
              type="password"
              placeholder="Enter your Stellar secret key"
              value={trustSecret}
              onChange={e => setTrustSecret(e.target.value)}
              className="p-2 rounded border"
            />
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleSignAndSubmitTrust}
              disabled={loading || !trustSecret}
            >
              Sign & Submit
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => setShowTrustPrompt(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showRemoveTrustPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl flex flex-col gap-4">
            <h3 className="font-bold text-lg">Sign Remove Trustline Transaction</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You are about to remove the trustline for {selectedAssetToRemove}. This action cannot be undone.
            </p>
            <input
              type="password"
              placeholder="Enter your Stellar secret key"
              value={removeTrustSecret}
              onChange={e => setRemoveTrustSecret(e.target.value)}
              className="p-2 rounded border"
            />
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleSignAndSubmitRemoveTrust}
              disabled={loading || !removeTrustSecret}
            >
              Sign & Remove
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => setShowRemoveTrustPrompt(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
