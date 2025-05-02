import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function BNBTest() {
  const [balance, setBalance] = useState<string>('');
  const [address, setAddress] = useState<string>('0x1234567890123456789012345678901234567890');
  const [loading, setLoading] = useState<boolean>(false);
  const [plugins, setPlugins] = useState<Array<{id: string, name: string, version: string}>>([]);
  const [error, setError] = useState<string>('');

  // Function to fetch BNB balance
  const fetchBalance = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/bnb?command=balance&address=${address}`);
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.balance);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch loaded plugins
  const fetchPlugins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bnb?command=plugins');
      const data = await response.json();
      
      if (data.success) {
        setPlugins(data.plugins);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plugins');
    } finally {
      setLoading(false);
    }
  };

  // Load plugins on initial page load
  useEffect(() => {
    fetchPlugins();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>BNB Test Page</title>
      </Head>
      
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="pb-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold">BNB Chain Test</h2>
                
                {/* Show error if exists */}
                {error && (
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Wallet Address Input */}
                <div>
                  <label className="block text-gray-700">Wallet Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                
                {/* Balance Check */}
                <div>
                  <button
                    onClick={fetchBalance}
                    disabled={loading}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Check Balance'}
                  </button>
                  
                  {balance && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium">BNB Balance:</h3>
                      <p className="text-xl font-bold">{balance} BNB</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Plugins List */}
              <div className="pt-6 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h3 className="text-lg font-medium">Loaded Plugins:</h3>
                <button
                  onClick={fetchPlugins}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                >
                  Refresh
                </button>
                
                {plugins.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {plugins.map((plugin) => (
                      <li key={plugin.id} className="p-2 border border-gray-200 rounded-md">
                        <div className="font-medium">{plugin.name}</div>
                        <div className="text-sm text-gray-500">ID: {plugin.id}</div>
                        <div className="text-sm text-gray-500">Version: {plugin.version}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No plugins loaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 