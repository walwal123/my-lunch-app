import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const result = await prisma.user.findMany();
        return Response.json({ data: result });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'DB 오류 발생' }, { status: 500 });
    }
}