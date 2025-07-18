import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const { user_id, lunch_name, lunch_date } = await req.json();

        const newLunch = await prisma.lunch.create({
            data: {
                user_id: parseInt(user_id),
                lunch_name,
                lunch_date: new Date(lunch_date),
            },
        });

        return NextResponse.json({ message: '저장 성공', lunch: newLunch });
    } catch (err) {
        console.error('점심 저장 실패:', err);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
        return NextResponse.json({ error: 'user_id 필요' }, { status: 400 });
    }

    try {
        const lunches = await prisma.lunch.findMany({
            where: { user_id: parseInt(user_id) },
        });

        return NextResponse.json({ lunches });
    } catch (err) {
        console.error('GET /api/lunch 에러:', err);
        return NextResponse.json({ error: '서버 에러' }, { status: 500 });
    }
}