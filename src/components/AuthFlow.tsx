
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Facebook, Google, Apple } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gray-50">
      {/* Animated Background Container */}
      <div className="absolute inset-0 flex">
        {/* Left Side - Form */}
        <div className={`w-1/2 bg-white transition-all duration-700 ease-in-out ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-6">
              {/* Logo */}
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">Xfluence</h1>
              </div>

              {/* Form Title */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Login' : 'Create Account'}
                </h2>
              </div>

              {/* Form */}
              <form className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium text-gray-600">Type</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger className="w-full h-12 border-gray-200 rounded-lg">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="agency">Agency/Brand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-600">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-12 border-gray-200 rounded-lg"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-600">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 border-gray-200 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-600">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-12 border-gray-200 rounded-lg"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-600">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="h-12 border-gray-200 rounded-lg"
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-sm text-cyan-500 hover:text-cyan-600">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className={`w-full h-12 rounded-lg font-medium text-white transition-all duration-200 ${
                    isLogin 
                      ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                  }`}
                >
                  {isLogin ? 'Login' : 'Register'}
                </Button>
              </form>

              {isLogin && (
                <>
                  <div className="text-center text-sm text-gray-500">
                    or login with
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                      <Facebook size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                      <Google size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
                      <Apple size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Animated Background */}
        <div className={`w-1/2 relative overflow-hidden transition-all duration-700 ease-in-out ${isLogin ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className={`h-full relative ${isLogin ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'}`}>
            {/* Animated fluid shapes */}
            <div className="absolute inset-0 overflow-hidden">
              {isLogin ? (
                <>
                  {/* Cyan fluid shapes for login */}
                  <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/30 to-cyan-600/20 blur-3xl animate-pulse"></div>
                  <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-br from-cyan-300/20 to-cyan-500/30 blur-2xl animate-pulse delay-1000"></div>
                  <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/25 to-cyan-400/15 blur-3xl animate-pulse delay-2000"></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-600/20 to-cyan-300/25 blur-2xl animate-pulse delay-500"></div>
                  
                  {/* Flowing lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,100 Q100,50 200,100 T400,100 L400,200 Q300,150 200,200 T0,200 Z" fill="url(#cyan-gradient)" opacity="0.3">
                      <animateTransform attributeName="transform" type="translate" values="0,0;20,10;0,0" dur="8s" repeatCount="indefinite"/>
                    </path>
                    <path d="M0,300 Q150,250 300,300 T600,300 L600,400 Q450,350 300,400 T0,400 Z" fill="url(#cyan-gradient)" opacity="0.2">
                      <animateTransform attributeName="transform" type="translate" values="0,0;-15,8;0,0" dur="10s" repeatCount="indefinite"/>
                    </path>
                    <defs>
                      <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00bcd4" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#4dd0e1" stopOpacity="0.2"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </>
              ) : (
                <>
                  {/* Purple fluid shapes for signup */}
                  <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-purple-400/30 to-purple-600/20 blur-3xl animate-pulse"></div>
                  <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-br from-purple-300/20 to-purple-500/30 blur-2xl animate-pulse delay-1000"></div>
                  <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/25 to-purple-400/15 blur-3xl animate-pulse delay-2000"></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/20 to-purple-300/25 blur-2xl animate-pulse delay-500"></div>
                  
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
                        <stop offset="0%" stopColor="#9c27b0" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#e1bee7" stopOpacity="0.2"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </>
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-center p-8 text-white">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-4xl font-bold mb-4">
                    {isLogin ? (
                      <>Welcome Back! <span className="text-3xl">👋</span></>
                    ) : (
                      <>Hello! <span className="text-3xl">👋</span></>
                    )}
                  </h2>
                  <p className="text-xl opacity-90 mb-6">
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
                  variant="outline"
                  className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900 px-8 py-3 rounded-full text-lg font-medium transition-all duration-300"
                >
                  {isLogin ? 'Register Now' : 'Login'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsiveness overlay */}
      <div className="md:hidden absolute inset-0 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Xfluence</h1>
            <h2 className="text-xl font-semibold text-gray-800">
              {isLogin ? 'Login' : 'Create Account'}
            </h2>
          </div>

          <form className="space-y-4">
            {!isLogin && (
              <>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="agency">Agency/Brand</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12"
                />
              </>
            )}

            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-12"
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="h-12"
            />

            {!isLogin && (
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="h-12"
              />
            )}

            <Button 
              type="submit" 
              className={`w-full h-12 text-white ${
                isLogin 
                  ? 'bg-gradient-to-r from-cyan-400 to-cyan-500' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600'
              }`}
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={toggleMode}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-6 flex justify-center space-x-4">
              <button className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <Facebook size={16} />
              </button>
              <button className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                <Google size={16} />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
                <Apple size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
