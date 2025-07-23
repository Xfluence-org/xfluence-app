
// Utility hook for handling Supabase type casting issues
export const useSupabaseTypeCasts = () => {
  // Helper function to cast string to UUID type for Supabase queries
  const castToUuid = (value: string) => value as any;
  
  // Helper function to cast objects for update operations
  const castForUpdate = <T>(obj: T) => obj as any;
  
  // Helper function to cast for insert operations
  const castForInsert = <T>(obj: T) => obj as any;
  
  // Helper function to cast query parameters
  const castQueryParam = (value: any) => value as any;
  
  // Helper function to check if query result is valid (not an error)
  const isValidResult = (result: any): boolean => {
    return result && typeof result === 'object' && !('error' in result) && !('message' in result);
  };
  
  // Helper function to safely access properties from query results
  const safeAccess = <T>(obj: any, property: string, defaultValue: T): T => {
    if (isValidResult(obj) && property in obj) {
      return obj[property];
    }
    return defaultValue;
  };

  // Helper function to check if array result is valid
  const isValidArrayResult = (result: any): result is any[] => {
    return Array.isArray(result) && result.every(item => isValidResult(item));
  };

  // Helper function to safely filter valid results from arrays
  const filterValidResults = (results: any[]): any[] => {
    return results.filter(result => isValidResult(result));
  };

  // Helper function to safely cast query results
  const castQueryResult = (result: any) => result as any;

  return {
    castToUuid,
    castForUpdate,
    castForInsert,
    castQueryParam,
    castQueryResult,
    isValidResult,
    safeAccess,
    isValidArrayResult,
    filterValidResults
  };
};
