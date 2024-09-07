import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { owner_address: string; domain_name: string } }
) {
  const { owner_address, domain_name } = params;

  const url = `https://guppy-saving-mistakenly.ngrok-free.app/proccess_loyality_check/${owner_address}/${domain_name}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
