import { ENSInfo } from './ensOwned';

export async function requestHdpProof(selectedENS: ENSInfo): Promise<{ success: boolean; message: string }> {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    console.error('BACKEND_URL is not defined in the environment variables');
    return { success: false, message: 'Backend URL is not configured' };
  }

  if (!selectedENS.ownerAddress) {
    console.error('Owner address is undefined for ENS:', selectedENS.name);
    return { success: false, message: 'Owner address is undefined' };
  }

  try {
    console.log('Sending request to backend:', `${backendUrl}/proccess_loyality_check/${selectedENS.ownerAddress}/${selectedENS.name}`);
    const response = await fetch(`${backendUrl}/proccess_loyality_check/${selectedENS.ownerAddress}/${selectedENS.name}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend response error:', response.status, errorText);
      return { success: false, message: `Backend error: ${response.status} ${response.statusText}` };
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const result = await response.json();
      console.log('Loyalty check result:', result);
      return { success: true, message: 'Loyalty check successful' };
    } else {
      const text = await response.text();
      console.error('Unexpected response type:', contentType, text);
      return { success: false, message: 'Unexpected response from backend' };
    }
  } catch (error) {
    console.error('Error processing loyalty check:', error);
    return { success: false, message: 'Failed to connect to the backend' };
  }
}
