import { ENSInfo } from './ensOwned';

async function checkHdpRequestStatus(domainName: string): Promise<boolean> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/request_status/${domainName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.ready === true;
    } catch (error) {
        console.error('Error checking HDP request status:', error);
        return false;
    }
}

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

            // Check HDP request status
            let isReady = false;
            for (let i = 0; i < 5; i++) {  // Try up to 5 times
                isReady = await checkHdpRequestStatus(selectedENS.name);
                if (isReady) break;
                await new Promise(resolve => setTimeout(resolve, 5000));  // Wait 5 seconds before checking again
            }

            if (isReady) {
                return { success: true, message: 'Loyalty check successful and HDP proof is ready' };
            } else {
                return { success: false, message: 'HDP proof is not ready yet. Please try again later.' };
            }
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
