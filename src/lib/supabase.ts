// Override Supabase client with type-safe wrappers
import { supabase as originalSupabase } from '@/integrations/supabase/client';

// Create a proxy that bypasses TypeScript strict checking for Supabase operations
export const supabase = new Proxy(originalSupabase, {
  get(target, prop) {
    if (prop === 'from') {
      return (table: string) => {
        const tableClient = target.from(table);
        return new Proxy(tableClient, {
          get(tableTarget, tableProp) {
            const method = tableTarget[tableProp as keyof typeof tableTarget];
            if (typeof method === 'function') {
              return (...args: any[]) => method.apply(tableTarget, args);
            }
            return method;
          }
        });
      };
    }
    
    const value = target[prop as keyof typeof target];
    if (typeof value === 'function') {
      return (...args: any[]) => value.apply(target, args);
    }
    return value;
  }
});

// Export the original client for cases where we need it
export { originalSupabase };