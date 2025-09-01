// Importing remote ESM modules at top-level confuses the TypeScript server in
// the monorepo; perform a dynamic import at runtime inside the function.

interface LogData {
    module: string;
    operation: string;
    data?: Record<string, unknown>;
    error?: string;
    ip_address?: string;
    user_agent?: string;
    user_id?: string | null;
}

// This function assumes it's called from a Deno environment where env vars are set
export async function logEvent(logData: LogData) {
    try {
    // Use an indirect import to avoid TypeScript trying to resolve the remote URL
    // at analysis time in the editor.
    // eslint-disable-next-line no-new-func
    const dynamicImport = new Function('m', 'return import(m)');
    const mod = await (dynamicImport as any)('https://esm.sh/@supabase/supabase-js@2');
    const { createClient } = mod as any;
        const serviceRoleClient = await createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

    const TABLES = { LOGS: 'logs' };
    // Respect LOG_LEVEL: 'all'|'light'|'mini' (default 'light')
    const level = (Deno.env.get('LOG_LEVEL') || 'light').toLowerCase();

    const payload: any = {
            module: logData.module,
            operation: logData.operation,
            error: logData.error,
            ip_address: logData.ip_address,
            user_agent: logData.user_agent,
            data: logData.data,
            user_id: logData.user_id ?? null,
        };

    if (level === 'mini') {
        // Remove user agent and data for mini
        delete payload.user_agent;
        delete payload.data;
    } else if (level === 'light') {
        // Remove only user_agent in light mode
        delete payload.user_agent;
    }

    const { error } = await serviceRoleClient.from(TABLES.LOGS).insert(payload);

        if (error) {
            console.error('Failed to write to log table:', error);
        }
    } catch (e) {
        console.error('Critical error in logging function itself:', e);
    }
}
