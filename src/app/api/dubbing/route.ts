import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { fileUrl, targetLanguages, userId } = await req.json();

    if (!fileUrl || !targetLanguages?.length || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const results = [];

    for (const targetLanguage of targetLanguages) {
      const response = await fetch(
        'https://api.elevenlabs.io/v1/dubbing',
        {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
          },
          body: new URLSearchParams({
            source_url: fileUrl,
            source_lang: 'en',
            target_lang: targetLanguage,
            mode: 'automatic',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();

        return NextResponse.json(
          { error: `ElevenLabs API error: ${errorData}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      results.push({
        language: targetLanguage,
        dubbingJobId: data.dubbing_id,
      });
    }

    return NextResponse.json({
      success: true,
      userId,
      results,
      message: 'Multi-language dubbing process initiated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
