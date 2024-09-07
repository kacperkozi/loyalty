import { ENSInfo } from './ensOwned';

export async function requestHdpProof(selectedENS: ENSInfo): Promise<{ success: boolean; message: string }> {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    console.error('BACKEND_URL is not defined in the environment variables');
    return { success: false, message: 'Backend URL is not configured' };
  }

  try {
    const response = await fetch(`${backendUrl}/proccess_loyality_check/${selectedENS.ownerAddress}/${selectedENS.name}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Loyalty check result:', result);
    return { success: true, message: 'Loyalty check successful' };
  } catch (error) {
    console.error('Error processing loyalty check:', error);
    return { success: false, message: 'Failed to connect to the backend' };
  }
}
