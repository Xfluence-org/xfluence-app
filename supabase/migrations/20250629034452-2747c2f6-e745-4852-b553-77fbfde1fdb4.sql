
-- Create a function to extract LLM campaign data from the most recent interaction
CREATE OR REPLACE FUNCTION get_campaign_llm_data(campaign_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    latest_interaction RECORD;
    parsed_output JSONB;
    plan_data JSONB;
BEGIN
    -- Get the most recent LLM interaction for the campaign
    SELECT raw_output INTO latest_interaction
    FROM llm_interactions 
    WHERE campaign_id = campaign_id_param 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Return empty object if no interaction found
    IF latest_interaction IS NULL THEN
        RETURN '{}'::JSONB;
    END IF;
    
    -- Parse the raw_output
    parsed_output := latest_interaction.raw_output;
    
    -- Check if there's a 'plan' key and extract it
    IF parsed_output ? 'plan' THEN
        plan_data := parsed_output->'plan';
    ELSE
        plan_data := parsed_output;
    END IF;
    
    RETURN plan_data;
END;
$$;

-- Create a function to get campaign details with LLM data
CREATE OR REPLACE FUNCTION get_campaign_with_llm_data(campaign_id_param UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT[],
    status TEXT,
    budget INTEGER,
    amount INTEGER,
    due_date DATE,
    created_at TIMESTAMPTZ,
    is_public BOOLEAN,
    brand_name TEXT,
    brand_logo_url TEXT,
    llm_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.status,
        c.budget,
        c.amount,
        c.due_date,
        c.created_at,
        c.is_public,
        b.name as brand_name,
        b.logo_url as brand_logo_url,
        get_campaign_llm_data(c.id) as llm_data
    FROM campaigns c
    LEFT JOIN brands b ON c.brand_id = b.id
    WHERE c.id = campaign_id_param;
END;
$$;

-- Create a function to extract specific LLM data sections
CREATE OR REPLACE FUNCTION extract_llm_section(campaign_id_param UUID, section_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    llm_data JSONB;
BEGIN
    -- Get the LLM data for the campaign
    llm_data := get_campaign_llm_data(campaign_id_param);
    
    -- Return the specific section or empty object if not found
    IF llm_data ? section_name THEN
        RETURN llm_data->section_name;
    ELSE
        RETURN '{}'::JSONB;
    END IF;
END;
$$;
