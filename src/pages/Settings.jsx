import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  Bell, 
  Moon, 
  Globe, 
  Lock, 
  Shield, 
  ChevronRight,
  Mail,
  Building,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();

  const preferences = [
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage notification preferences',
      color: 'text-blue-600'
    },
    {
      icon: Moon,
      title: 'Appearance',
      description: 'Dark mode and themes',
      color: 'text-purple-600'
    },
    {
      icon: Globe,
      title: 'Language',
      description: 'English (US)',
      color: 'text-green-600'
    }
  ];

  const security = [
    {
      icon: Lock,
      title: 'Change Password',
      description: 'Update your password',
      color: 'text-orange-600'
    },
    {
      icon: Shield,
      title: 'Two-Factor Auth',
      description: 'Add extra security',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header 
            title="Settings" 
            subtitle="Manage your account and preferences"
          />

          {/* Profile Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold text-2xl">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'Sarah Johnson'}</h2>
                  <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 rounded">Admin</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">Administration</span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user?.email || 'sarah.johnson@company.com'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Department</p>
                  <p className="font-medium text-gray-900">Administration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
            <div className="space-y-2">
              {preferences.map((pref, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className={`p-2 bg-gray-100 rounded-lg ${pref.color}`}>
                    <pref.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{pref.title}</p>
                    <p className="text-sm text-gray-600">{pref.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
            <div className="space-y-2">
              {security.map((sec, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className={`p-2 bg-gray-100 rounded-lg ${sec.color}`}>
                    <sec.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{sec.title}</p>
                    <p className="text-sm text-gray-600">{sec.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Smart VMS v1.0.0 • © 2024 All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;