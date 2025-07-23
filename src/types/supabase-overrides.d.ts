// Global type overrides for Supabase to fix type casting issues
declare global {
  interface Window {
    // Add any window extensions if needed
  }
}

// Override Supabase client types to be more permissive
declare module '@supabase/supabase-js' {
  interface PostgrestQueryBuilder<
    Schema extends GenericSchema,
    Row extends Record<string, unknown>,
    Result = Row[],
    RelationName = unknown,
    Relationships = unknown
  > {
    eq(column: string | keyof Row, value: any): this;
    neq(column: string | keyof Row, value: any): this;
    gt(column: string | keyof Row, value: any): this;
    gte(column: string | keyof Row, value: any): this;
    lt(column: string | keyof Row, value: any): this;
    lte(column: string | keyof Row, value: any): this;
    like(column: string | keyof Row, value: any): this;
    ilike(column: string | keyof Row, value: any): this;
    is(column: string | keyof Row, value: any): this;
    in(column: string | keyof Row, values: any[]): this;
    contains(column: string | keyof Row, value: any): this;
    containedBy(column: string | keyof Row, value: any): this;
    rangeGt(column: string | keyof Row, value: any): this;
    rangeGte(column: string | keyof Row, value: any): this;
    rangeLt(column: string | keyof Row, value: any): this;
    rangeLte(column: string | keyof Row, value: any): this;
    rangeAdjacent(column: string | keyof Row, value: any): this;
    overlaps(column: string | keyof Row, value: any): this;
    textSearch(column: string | keyof Row, query: string, options?: any): this;
    match(query: Record<string, any>): this;
    not(column: string | keyof Row, operator: string, value: any): this;
    or(filters: string, options?: any): this;
    filter(column: string | keyof Row, operator: string, value: any): this;
  }

  interface PostgrestFilterBuilder<
    Schema extends GenericSchema,
    Row extends Record<string, unknown>,
    Result = Row[],
    RelationName = unknown,
    Relationships = unknown
  > extends PostgrestQueryBuilder<Schema, Row, Result, RelationName, Relationships> {
    update(values: any, options?: any): PostgrestFilterBuilder<Schema, Row, Result, RelationName, Relationships>;
    upsert(values: any, options?: any): PostgrestFilterBuilder<Schema, Row, Result, RelationName, Relationships>;
    insert(values: any, options?: any): PostgrestFilterBuilder<Schema, Row, Result, RelationName, Relationships>;
    delete(options?: any): PostgrestFilterBuilder<Schema, Row, Result, RelationName, Relationships>;
  }
}

export {};