import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { fileUrl, targetLanguages, userId } = await req.json();

    if (!fileUrl || !targetLanguages || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Call the ElevenLabs Dubbing API to start the translation job
    // It automatically preserves the creator's original voice tone and pacing
    const response = await fetch('https://elevenlabs.io', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'automatic',
        source_lang: 'en',
        target_langs: targetLanguages, // Array of languages e.g., ["es", "fr"]
        file_url: fileUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: `ElevenLabs API error: ${errorData}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Return the successful background job ID back to Aurora
    return NextResponse.json({ 
      success: true, 
      dubbingJobId: data.dubbing_id,
      message: 'Multi-language dubbing process initiated successfully.' 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
