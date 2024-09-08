async function checkHdpRequestStatus(domainName: string): Promise<{ ready: boolean; status: string; nft_mint_transaction_hash?: string }> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/get_all_requests`, {
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
        }

        const responseJSON = result;
        console.log('Response JSON:', responseJSON);

        // Assuming the response contains an array of requests
        const request = responseJSON.find((req: any) => req.domain_name === domainName);

        if (request) {
            return {
                ready: request.status === 'PROOF_DONE',
                status: request.status,
                nft_mint_transaction_hash: request.nft_mint_transaction_hash
            };
        } else {
            return { ready: false, status: 'NOT_FOUND' };
        }

    } catch (error) {
        console.error('Error in checkHdpRequestStatus:', error);
        return { ready: false, status: 'ERROR' };
    }
}