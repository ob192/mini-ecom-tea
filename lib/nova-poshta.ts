/**
 * Server-only Nova Poshta client.
 * The API key lives in NOVA_POSHTA_API_KEY (server env) and is NEVER exposed to
 * the browser — all NP traffic is proxied through /api/np/* route handlers.
 *
 * Docs: https://developers.novaposhta.ua/documentation
 */

const NP_ENDPOINT = 'https://api.novaposhta.ua/v2.0/json/';

export async function npCall<T = unknown>(
    modelName: string,
    calledMethod: string,
    methodProperties: Record<string, unknown>,
): Promise<T[]> {
    const apiKey = process.env.NOVA_POSHTA_API_KEY;
    if (!apiKey) throw new Error('NOVA_POSHTA_API_KEY is not set');

    const res = await fetch(NP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, modelName, calledMethod, methodProperties }),
        signal: AbortSignal.timeout(10_000),
        // NP directories change slowly; let Next cache the upstream fetch a bit.
        next: { revalidate: 3600 },
    });

    const json = (await res.json()) as {
        success: boolean;
        data: T[];
        errors?: string[];
    };

    if (!json.success) {
        throw new Error((json.errors ?? []).join('; ') || 'Nova Poshta request failed');
    }
    return json.data ?? [];
}

export interface NpCity {
    Ref: string;
    Description: string;
    AreaDescription?: string;
    SettlementTypeDescription?: string;
}

export interface NpWarehouse {
    Ref: string;
    Number: string;
    Description: string;
    TypeOfWarehouse: string;
    ShortAddress?: string;
}