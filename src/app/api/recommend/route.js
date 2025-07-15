async function getValidGptResponse(prompt, expectedCount = 2, maxRetries = 5) {
    const pattern = /(\S+)\s*:\s*([^,]+)/g;

    for (let i = 0; i < maxRetries; i++) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
            }),
        });

        const data = await res.json();
        if (!data.choices || !data.choices[0]) continue;

        const reply = data.choices[0].message.content.trim();
        const matches = [...reply.matchAll(pattern)];

        if (matches.length >= 1) {
            return { reply, matches };
        }

        console.warn(`GPT 응답 재시도 (${i + 1}/${maxRetries}):`, reply);
    }

    throw new Error("유효한 GPT 응답을 받지 못했습니다.");
}

export async function POST(req) {
    try {
        const { keywords, location } = await req.json();

        if (!keywords || !location) {
            return Response.json({ error: "키워드와 위치는 필수입니다." }, { status: 400 });
        }

        const prompt = `
        앞으로 대답은 내가 정해준 틀에서만 해. ${keywords.join(', ')} 메뉴를 추천해주는데,
        형식은 꼭 ${keywords.join(', ')} 메뉴별로 'xx메뉴 : 음식이름, ...' 이렇게 이어지는 형식으로 맞춰서 말해 
        추천할 때 너무 흔한 메뉴만 반복하지 말고,
        그렇다고 너무 생소하거나 세분화된 메뉴(예: 들깨해물칼국수, 소면짜장)도 피해야 해.
        적당히 대중적이면서 실제 검색이나 점식식사때 먹기 좋은 메뉴로 골라줘.
        대답은 문장 덧붙이지 말고 내가 위에서 말한 형식대로만 말해
    `;
        console.log(prompt);

        //GPT 요청 원하는 대답 나올때까지 +5번
        const { reply: gptReply, matches } = await getValidGptResponse(prompt, keywords.length);
        console.log("GPT 최종 응답:", gptReply);

        const results = [];

        for (const match of matches) {
            const type = match[1]?.trim();
            const name = match[2]?.trim();
            console.log("추출된 카테고리:", type);
            console.log("추출된 메뉴:", name);

            if (!type || !name) continue;

            const query = `${location} ${name}`;
            console.log(` 네이버 검색 쿼리: ${query}`);

            // 네이버 API 요청
            const naverRes = await fetch(
                `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=1`,
                {
                    headers: {
                        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
                        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
                    },
                }
            );

            const naverData = await naverRes.json();
            console.log(" 네이버 검색 응답:", naverData.items?.[0]);

            const item = naverData.items?.[0];

            if (item) {
                results.push({
                    category: type,
                    menu: name,
                    store: item.title.replace(/<[^>]*>/g, ''),
                    address: item.roadAddress,
                });
            } else {
                // results.push({
                //     category: type,
                //     menu: name,
                //     store: '검색 결과 없음',
                //     address: '정보 없음',
                // });
                console.log("검색 결과 없음: 결과 무시됨");
                results.push({
                    category: type,
                    menu: name,
                    store: '근처 가게 없음',
                    address: 'x',
                });
            }
        }

        return Response.json({ data: results });

    } catch (err) {
        console.error("에러:", err);
        return Response.json({ error: "서버 오류 발생" }, { status: 500 });
    }
}