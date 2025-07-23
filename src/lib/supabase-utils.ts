// Utility functions to handle Supabase type casting issues
import { supabase } from '@/integrations/supabase/client';

// Create a typed-safe wrapper for supabase operations
export const supabaseClient = new Proxy(supabase, {
  get(target, prop) {
    const value = target[prop as keyof typeof target];
    if (typeof value === 'function') {
      return function(...args: any[]) {
        return value.apply(target, args);
      };
    }
    if (prop === 'from') {
      return function(table: string) {
        const tableClient = target.from(table);
        return new Proxy(tableClient, {
          get(tableTarget, tableProp) {
            const tableValue = tableTarget[tableProp as keyof typeof tableTarget];
            if (typeof tableValue === 'function') {
              return function(...args: any[]) {
                return tableValue.apply(tableTarget, args);
              };
            }
            return tableValue;
          }
        });
      };
    }
    return value;
  }
});

// Export the original client for cases where we need it
export { supabase as originalSupabase };