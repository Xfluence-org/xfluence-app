// Type utilities for Supabase operations to handle strict TypeScript checking
export const sb = {
  // Cast any value for use in Supabase query parameters
  cast: (value: any) => value as any,
  
  // Cast objects for insert operations
  insert: (obj: any) => obj as any,
  
  // Cast objects for update operations  
  update: (obj: any) => obj as any,
  
  // Safe property access with fallback
  get: (obj: any, prop: string, fallback: any = null) => {
    if (obj && typeof obj === 'object' && !('error' in obj) && prop in obj) {
      return obj[prop];
    }
    return fallback;
  },
  
  // Check if result is valid (not an error)
  isValid: (result: any): boolean => {
    return result && typeof result === 'object' && !('error' in result) && !('message' in result);
  }
};