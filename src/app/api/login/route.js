import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
    const { id, user_pw } = await req.json();

    const user = await prisma.user.findFirst({
        where: { id }
    });

    if (!user || user.user_pw !== user_pw) {
        return NextResponse.json({ error: '아이디 또는 비밀번호가 틀립니다.' }, { status: 401 });
    }

    const res = NextResponse.json({ message: '로그인 성공', user });

    res.cookies.set('user_id', String(user.user_id));
    res.cookies.set('user_name', user.user_name);

    return res;
}