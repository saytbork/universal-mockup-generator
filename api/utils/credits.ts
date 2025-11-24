import { sql } from '@vercel/postgres';

export async function checkAndConsumeCredit(userId: string): Promise<number> {
    const bypass =
        process.env.DISABLE_CREDITS === '1' ||
        process.env.CREDITS_BYPASS === '1' ||
        !process.env.POSTGRES_URL;

    if (bypass) {
        // Preview/sandbox mode: no DB, no credit gating.
        return 999;
    }

    if (!userId) {
        throw new Error("ID de usuario no proporcionado. Debes iniciar sesión.");
    }

    console.log(`Checking credits for user: ${userId}`);

    try {
        // A. Verificar Créditos
        const result = await sql`
        SELECT credits FROM users WHERE user_id = ${userId};
    `;

        const currentCredits = result.rows.length > 0 ? result.rows[0].credits : 0;

        if (currentCredits < 1) {
            console.warn(`Insufficient credits for ${userId}`);
            throw new Error("Créditos insuficientes. Por favor, compra un plan.");
        }

        // B. Consumir Crédito (Solo si tiene créditos)
        await sql`
        UPDATE users SET credits = credits - 1 WHERE user_id = ${userId};
    `;

        console.log(`Credit consumed for ${userId}. Remaining: ${currentCredits - 1}`);
        // Devolver el saldo restante
        return currentCredits - 1;
    } catch (error) {
        console.error('Database error in checkAndConsumeCredit:', error);
        throw error; // Re-throw to be handled by the caller
    }
}
