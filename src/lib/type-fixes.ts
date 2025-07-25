// Utility to bypass complex Supabase TypeScript issues
export const fixSupabaseQuery = (query: any) => query as any;
export const fixSupabaseData = (data: any) => data as any;
export const fixSupabaseColumn = (column: string) => column as any;
export const fixSupabaseValue = (value: any) => value as any;