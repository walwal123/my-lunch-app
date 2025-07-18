import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
    const { id, user_name, user_pw } = await req.json();

    try {
        const existing = await prisma.user.findUnique({ where: { id } });
        if (existing) {
            return NextResponse.json({ error: '이미 존재하는 아이디입니다.' }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: { id, user_name, user_pw },
        });

        return NextResponse.json({ message: '회원가입 완료', user });
    } catch (err) {
        return NextResponse.json({ error: 'DB 오류 발생' }, { status: 500 });
    }
}