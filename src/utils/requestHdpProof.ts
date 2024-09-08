import { ENSInfo } from './ensOwned';

async function checkHdpRequestStatus(domainName: string): Promise<{ ready: boolean; status: string; nft_mint_transaction_hash?: string }> {
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
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend response error:', response.status, errorText);
           // return { success: false, message: `Backend error: ${response.status} ${response.statusText}` };
        }
       // const responseText = await response.text();
        //console.log('Response text:', responseText);

        const responseJSON = result;//JSON.parse(responseText);
        console.log('Response JSON:', responseJSON);

        if (responseJSON[0].status === 'PROOF_DONE') {
            return { 
                ready: true, 
                status: responseJSON[0].status, 
                nft_mint_transaction_hash: responseJSON[0].nft_mint_transaction_hash
            };
            //return { success: true, message: 'Loyalty check successful and HDP proof is ready', status: responseJSON.status };
        } else {
            return { 
                ready: false, 
                status: responseJSON[0].status, 
                nft_mint_transaction_hash: responseJSON[0].nft_mint_transaction_hash
            };
            //return { success: false, message: 'HDP proof is not ready yet. Please try again later.', status: responseJSON.status };
        }
        
    } catch (error) {
        console.error('Error checking HDP request status:', error);
        return { ready: false, status: '' };
    }
}

export async function requestHdpProof(selectedENS: ENSInfo): Promise<{ success: boolean; message: string; status?: string; nft_mint_transaction_hash?: string }> {
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
            let status = '';
            let txHash = '';
            for (let i = 0; i < 1000; i++) {
                const statusResult = await checkHdpRequestStatus(selectedENS.name);
                console.log(`Status check ${i + 1}:`, statusResult);
                isReady = statusResult.ready;
                status = statusResult.status;
                txHash = statusResult.nft_mint_transaction_hash || '';
                if (isReady) break;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            console.log('Final status:', { isReady, status, txHash });

            if (isReady && status === 'PROOF_DONE') {
                return { success: true, message: 'Loyalty check successful and HDP proof is ready', status, nft_mint_transaction_hash: txHash };
            } else {
                return { success: false, message: 'HDP proof is not ready yet. Please try again later.', status };
            }
        } else {
            const text = await response.text();
            console.error('Unexpected response type:', contentType, text);
            return { success: false, message: 'Unexpected response from backend' };
        }
    } catch (error) {
        console.error('Error in requestHdpProof:', error);
        return { success: false, message: 'Failed to connect to the backend', status: 'ERROR' };
    }
}
