import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Facebook, Mail, Apple } from 'lucide-react';

const AuthFlow = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      type: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to dashboard selection instead of directly to influencer dashboard
    window.location.href = '/dashboard-selection';
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Panel - Form Section (45% width) */}
      <div className={`w-[45%] bg-white relative transition-all duration-700 ease-in-out ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Brand Header */}
        <div className="absolute top-6 left-6">
          <h1 className="text-lg font-medium text-[#1a1f2e]">Xfluence</h1>
        </div>

        {/* Form Container */}
        <div className="h-full flex items-center justify-center px-12">
          <div className="w-full max-w-[400px] space-y-6">
            {/* Form Title */}
            <div className="mt-16">
              <h2 className="text-[28px] font-bold text-[#1a1f2e] mb-8">
                {isLogin ? 'Login' : 'Create Account'}
              </h2>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium text-[#6c757d]">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className="w-full h-12 bg-[#f8f9fa] border border-[#e9ecef] rounded-lg">
                        <SelectValue placeholder="Type" className="text-[#6c757d]" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="influencer">Influencer</SelectItem>
                        <SelectItem value="agency">Agency/Brand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-[#6c757d]">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="h-12 bg-[#f8f9fa] border border-[#e9ecef] rounded-lg px-4 text-base placeholder:text-[#6c757d] focus:border-[#9d4edd]"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#6c757d]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`h-12 bg-[#f8f9fa] border border-[#e9ecef] rounded-lg px-4 text-base placeholder:text-[#6c757d] ${
                    isLogin ? 'focus:border-[#1DDCD3]' : 'focus:border-[#9d4edd]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#6c757d]">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`h-12 bg-[#f8f9fa] border border-[#e9ecef] rounded-lg px-4 text-base placeholder:text-[#6c757d] ${
                    isLogin ? 'focus:border-[#1DDCD3]' : 'focus:border-[#9d4edd]'
                  }`}
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#6c757d]">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="h-12 bg-[#f8f9fa] border border-[#e9ecef] rounded-lg px-4 text-base placeholder:text-[#6c757d] focus:border-[#9d4edd]"
                  />
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-sm text-[#1DDCD3] hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className={`w-full h-12 rounded-full font-bold text-base text-white transition-all duration-200 ${
                  isLogin 
                    ? 'bg-[#1DDCD3] hover:bg-[#00D4C7]' 
                    : 'bg-[#9d4edd] hover:bg-[#a855f7]'
                }`}
              >
                {isLogin ? 'Login' : 'Register'}
              </Button>
            </form>

            {isLogin && (
              <>
                <div className="text-center text-sm text-[#6c757d]">
                  or login with
                </div>

                <div className="flex justify-center space-x-3">
                  <button className="w-11 h-11 rounded-full bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center hover:bg-[#e9ecef] transition-colors">
                    <Facebook size={20} className="text-[#1877f2]" />
                  </button>
                  <button className="w-11 h-11 rounded-full bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center hover:bg-[#e9ecef] transition-colors">
                    <Mail size={20} className="text-[#ea4335]" />
                  </button>
                  <button className="w-11 h-11 rounded-full bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center hover:bg-[#e9ecef] transition-colors">
                    <Apple size={20} className="text-[#000000]" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Hero Section (55% width) */}
      <div className={`w-[55%] relative overflow-hidden transition-all duration-700 ease-in-out ${isLogin ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full relative bg-gradient-to-br from-[#1a1f2e] to-[#252b3b]">
          {/* Animated fluid shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {isLogin ? (
              <>
                {/* Teal fluid shapes for login */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#1DDCD3] opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#00D4C7] opacity-40 blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-[#1DDCD3] opacity-30 blur-3xl animate-pulse delay-2000"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#00D4C7] opacity-25 blur-2xl animate-pulse delay-500"></div>
                
                {/* Flowing lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,100 Q100,50 200,100 T400,100 L400,200 Q300,150 200,200 T0,200 Z" fill="url(#teal-gradient)" opacity="0.3">
                    <animateTransform attributeName="transform" type="translate" values="0,0;20,10;0,0" dur="8s" repeatCount="indefinite"/>
                  </path>
                  <path d="M0,300 Q150,250 300,300 T600,300 L600,400 Q450,350 300,400 T0,400 Z" fill="url(#teal-gradient)" opacity="0.2">
                    <animateTransform attributeName="transform" type="translate" values="0,0;-15,8;0,0" dur="10s" repeatCount="indefinite"/>
                  </path>
                  <defs>
                    <linearGradient id="teal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1DDCD3" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#00D4C7" stopOpacity="0.2"/>
                    </linearGradient>
                  </defs>
                </svg>
              </>
            ) : (
              <>
                {/* Purple fluid shapes for signup */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#9d4edd] opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#a855f7] opacity-40 blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-[#9d4edd] opacity-30 blur-3xl animate-pulse delay-2000"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#a855f7] opacity-25 blur-2xl animate-pulse delay-500"></div>
                
                {/* Flowing lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,100 Q100,50 200,100 T400,100 L400,200 Q300,150 200,200 T0,200 Z" fill="url(#purple-gradient)" opacity="0.3">
                    <animateTransform attributeName="transform" type="translate" values="0,0;20,10;0,0" dur="8s" repeatCount="indefinite"/>
                  </path>
                  <path d="M0,300 Q150,250 300,300 T600,300 L600,400 Q450,350 300,400 T0,400 Z" fill="url(#purple-gradient)" opacity="0.2">
                    <animateTransform attributeName="transform" type="translate" values="0,0;-15,8;0,0" dur="10s" repeatCount="indefinite"/>
                  </path>
                  <defs>
                    <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9d4edd" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2"/>
                    </linearGradient>
                  </defs>
                </svg>
              </>
            )}
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-center justify-center p-12 text-white">
            <div className="text-center space-y-6 max-w-md">
              <div>
                <h2 className="text-[36px] font-bold mb-6 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.03em' }}>
                  {isLogin ? (
                    <>Welcome Back!</>
                  ) : (
                    <>Hello! 👋</>
                  )}
                </h2>
                <p className="text-[28px] leading-[43px] opacity-90" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isLogin ? (
                    <>
                      Don't have an account?<br />
                      Enter your details and start journey with us
                    </>
                  ) : (
                    <>
                      Already have an account?<br />
                      Login with your personal info
                    </>
                  )}
                </p>
              </div>
              
              <Button
                onClick={toggleMode}
                className="border-3 border-white text-white bg-transparent hover:bg-white hover:text-[#1a1f2e] px-8 py-6 rounded-full text-[25px] font-medium transition-all duration-300"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  borderWidth: '3px',
                  padding: '29.7px 0px',
                  minWidth: '165px'
                }}
              >
                {isLogin ? 'Register' : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsiveness overlay */}
      <div className="md:hidden absolute inset-0 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-lg font-medium text-[#1a1f2e] mb-2">Xfluence</h1>
            <h2 className="text-xl font-semibold text-[#1a1f2e]">
              {isLogin ? 'Login' : 'Create Account'}
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="w-full h-12 bg-[#f8f9fa] border border-[#e9ecef]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="influencer">Influencer</SelectItem>
                    <SelectItem value="agency">Agency/Brand</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12 bg-[#f8f9fa] border border-[#e9ecef]"
                />
              </>
            )}

            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-12 bg-[#f8f9fa] border border-[#e9ecef]"
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="h-12 bg-[#f8f9fa] border border-[#e9ecef]"
            />

            {!isLogin && (
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="h-12 bg-[#f8f9fa] border border-[#e9ecef]"
              />
            )}

            <Button 
              type="submit" 
              className={`w-full h-12 text-white rounded-full ${
                isLogin 
                  ? 'bg-[#1DDCD3] hover:bg-[#00D4C7]' 
                  : 'bg-[#9d4edd] hover:bg-[#a855f7]'
              }`}
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={toggleMode}
              className="text-sm text-[#6c757d] hover:text-[#1a1f2e]"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-6 flex justify-center space-x-4">
              <button className="w-10 h-10 rounded-full bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center">
                <Facebook size={16} className="text-[#1877f2]" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center">
                <Mail size={16} className="text-[#ea4335]" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center">
                <Apple size={16} className="text-[#000000]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
