export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '노고산동 김치찌개';

    const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
    const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

    const res = await fetch(`https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5`, {
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        },
    });

    const data = await res.json();
    return Response.json(data);
}