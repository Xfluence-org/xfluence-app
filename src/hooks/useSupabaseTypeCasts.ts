
// Utility hook for handling Supabase type casting issues
export const useSupabaseTypeCasts = () => {
  // Helper function to cast string to UUID type for Supabase queries
  const castToUuid = (value: string) => value as any;
  
  // Helper function to cast objects for update operations
  const castForUpdate = <T>(obj: T) => obj as any;
  
  // Helper function to check if query result is valid (not an error)
  const isValidResult = (result: any): boolean => {
    return result && typeof result === 'object' && !('error' in result);
  };
  
  // Helper function to safely access properties from query results
  const safeAccess = <T>(obj: any, property: string, defaultValue: T): T => {
    if (isValidResult(obj) && property in obj) {
      return obj[property];
    }
    return defaultValue;
  };

  return {
    castToUuid,
    castForUpdate,
    isValidResult,
    safeAccess
  };
};
