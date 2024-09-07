import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { owner_address: string; domain_name: string } }
) {
  const { owner_address, domain_name } = params;

  const url = `https://guppy-saving-mistakenly.ngrok-free.app/proccess_loyality_check/${owner_address}/${domain_name}`;

  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
