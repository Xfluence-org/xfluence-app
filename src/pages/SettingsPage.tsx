
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Save, User, Mail, Instagram, Youtube, Key } from 'lucide-react';

const SettingsPage = () => {
  const { user, profile, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: user?.email || '',
    bio: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    followerCount: '',
    category: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1DDCD3]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.user_type !== 'Influencer') {
    return <Navigate to="/brand-dashboard" replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', formData);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userName={profile?.name} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">Settings</h1>
            <p className="text-gray-600">Manage your profile and account preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#1DDCD3]" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your basic profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="e.g., Lifestyle, Beauty, Tech"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followerCount">Total Followers</Label>
                    <Input
                      id="followerCount"
                      value={formData.followerCount}
                      onChange={(e) => handleInputChange('followerCount', e.target.value)}
                      placeholder="e.g., 50000"
                      type="number"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell brands about yourself..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-[#1DDCD3]" />
                  Social Media Accounts
                </CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={formData.youtube}
                      onChange={(e) => handleInputChange('youtube', e.target.value)}
                      placeholder="Channel name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      value={formData.tiktok}
                      onChange={(e) => handleInputChange('tiktok', e.target.value)}
                      placeholder="@username"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#1DDCD3]" />
                  Account Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  Enable Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#1DDCD3]" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>New campaign invitations</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Campaign updates</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Marketing emails</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Payment notifications</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90">
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
