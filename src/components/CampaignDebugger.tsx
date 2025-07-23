import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Campaign {
  id: string;
  title: string;
  created_at: string;
  status?: string;
  brand_id?: string;
}

const CampaignDebugger: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [llmData, setLlmData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all campaigns
      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('id, title, created_at, status, brand_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setCampaigns(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testLLMData = async (campaignId: string) => {
    try {
      // Test get_campaign_llm_data function
      const { data: llmData, error: llmError } = await supabase
        .rpc('get_campaign_llm_data', { campaign_id_param: campaignId });
      
      // Also fetch basic campaign info
      const { data: campaignInfo, error: infoError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      // Check llm_interactions table
      const { data: interactions, error: intError } = await supabase
        .from('llm_interactions')
        .select('id, created_at, call_type, raw_output')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      // Check specifically for campaign_planner entries
      const { data: plannerEntries, error: plannerError } = await supabase
        .from('llm_interactions')
        .select('id, created_at, raw_output')
        .eq('campaign_id', campaignId)
        .eq('call_type', 'campaign_planner')
        .order('created_at', { ascending: false })
        .limit(1);
      
      const result = {
        llmData: llmError ? { error: llmError.message } : llmData,
        campaignInfo: infoError ? { error: infoError.message } : campaignInfo,
        recentInteractions: intError ? { error: intError.message } : interactions,
        campaignPlannerEntries: plannerError ? { error: plannerError.message } : plannerEntries,
        isEmpty: llmData && Object.keys(llmData).length === 0,
        hasCampaignPlanner: plannerEntries && plannerEntries.length > 0
      };
      
      console.log('Debug result:', result);
      setLlmData(result);
    } catch (err) {
      console.error('Error:', err);
      setLlmData({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  const checkUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('Current user ID:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUserProfile({ 
          userId: user.id, 
          profile, 
          error: profileError,
          user 
        });
      }
    } catch (err) {
      console.error('Error checking user profile:', err);
      setUserProfile({ error: err });
    }
  };

  useEffect(() => {
    fetchCampaigns();
    checkUserProfile();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Campaign Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={fetchCampaigns} disabled={loading}>
            Refresh Campaigns
          </Button>
          
          {loading && <p>Loading campaigns...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          
          {!loading && campaigns.length === 0 && (
            <p className="text-yellow-600">No campaigns found in database</p>
          )}
          
          {campaigns.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Found {campaigns.length} campaigns:</h3>
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-3 border rounded-md space-y-2">
                  <p><strong>Title:</strong> {campaign.title}</p>
                  <p><strong>ID:</strong> {campaign.id}</p>
                  <p><strong>Created:</strong> {new Date(campaign.created_at).toLocaleString()}</p>
                  <p><strong>Status:</strong> {campaign.status || 'N/A'}</p>
                  <p><strong>Brand ID:</strong> {campaign.brand_id || 'N/A'}</p>
                  <Button 
                    size="sm" 
                    onClick={() => testLLMData(campaign.id)}
                  >
                    Test LLM Data Function
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {llmData && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <h3 className="font-semibold mb-2">LLM Data Result:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(llmData, null, 2)}
              </pre>
            </div>
          )}
          
          {userProfile && (
            <div className="mt-4 p-3 bg-blue-100 rounded-md">
              <h3 className="font-semibold mb-2">Current User Profile:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignDebugger;