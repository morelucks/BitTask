import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        // Basic logging of the event
        console.log('Received Chainhook Event:', JSON.stringify(payload, null, 2));

        // You can process the even type here (e.g., 'created', 'accepted')
        // and update a database or trigger other actions.

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
        console.error('Error processing chainhook event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
