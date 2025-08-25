import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface LogData {
    module: string;
    operation: string;
    data?: Record<string, unknown>;
    error?: string;
    ip_address?: string;
    user_agent?: string;
}

// This function assumes it's called from a Deno environment where env vars are set
export async function logEvent(logData: LogData) {
    try {
        const serviceRoleClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { error } = await serviceRoleClient.from('logs').insert({
            module: logData.module,
            operation: logData.operation,
            data: logData.data,
            error: logData.error,
            ip_address: logData.ip_address,
            user_agent: logData.user_agent
        });

        if (error) {
            console.error('Failed to write to log table:', error);
        }
    } catch (e) {
        console.error('Critical error in logging function itself:', e);
    }
}
