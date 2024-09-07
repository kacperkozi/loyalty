import { ENSInfo } from './ensOwned';

export function getTopDurationNFTs(nfts: ENSInfo[], topCount: number = 10): ENSInfo[] {
  // Sort the NFTs by ownership duration in descending order
  const sortedNFTs = nfts.sort((a, b) => {
    const durationA = parseDuration(a.ownershipDuration);
    const durationB = parseDuration(b.ownershipDuration);
    return durationB - durationA;
  });

  // Return the top 'topCount' NFTs
  return sortedNFTs.slice(0, topCount);
}

function parseDuration(duration: string): number {
  const parts = duration.split(', ');
  let totalDays = 0;

  for (const part of parts) {
    const [value, unit] = part.split(' ');
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 'year':
      case 'years':
        totalDays += numValue * 365;
        break;
      case 'month':
      case 'months':
        totalDays += numValue * 30;
        break;
      case 'day':
      case 'days':
        totalDays += numValue;
        break;
    }
  }

  return totalDays;
}
