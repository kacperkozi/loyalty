import { ENSInfo } from './ensOwned';

export async function requestHdpProof(selectedENS: ENSInfo): Promise<{ success: boolean; message: string }> {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    console.error('BACKEND_URL is not defined in the environment variables');
    return { success: false, message: 'Backend URL is not configured' };
  }

  try {
    const response = await fetch(`${backendUrl}/initiate-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ensName: selectedENS.name,
        tokenId: selectedENS.tokenId,
        ownershipDuration: selectedENS.ownershipDuration,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Proof initiation result:', result);
    return { success: true, message: 'Proof initiation successful' };
  } catch (error) {
    console.error('Error initiating HDP proof:', error);
    return { success: false, message: 'Failed to connect to the backend' };
  }
}
