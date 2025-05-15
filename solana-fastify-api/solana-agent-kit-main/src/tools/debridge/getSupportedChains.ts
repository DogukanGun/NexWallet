import { DEBRIDGE_API } from "../../constants";
import { deBridgeSupportedChainsResponse } from "../../types";

/**
 * Get list of chains supported by deBridge protocol
 * @returns List of supported chains with their configurations
 * @throws {Error} If the API request fails or returns an error
 */
export async function getDebridgeSupportedChains(): Promise<deBridgeSupportedChainsResponse> {
  const response = await fetch(`${DEBRIDGE_API}/supported-chains-info`);

  if (!response.ok) {
    throw new Error(`Failed to fetch supported chains: ${response.statusText}`);
  }

  const data = await response.json() as deBridgeSupportedChainsResponse & { error?: string | { message?: string; code?: number } };

  if ("error" in data) {
    const errorMessage = typeof data.error === 'string' ? data.error : (data.error.message || 'Unknown API error');
    throw new Error(`API Error: ${errorMessage}`);
  }

  return data;
}
