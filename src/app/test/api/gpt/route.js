export async function POST(req) {
    const { prompt } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    const data = await response.json();
    console.log('GPT 응답 전체:', data);
    return Response.json({ result: data.choices[0].message.content });
}