import React, { useState, useEffect } from 'react';
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import { AlertTriangle, MapPin, Clock, User, Camera, RefreshCw } from 'lucide-react';

const SecurityAlertsDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, geofence, restricted, unknown

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'geofence' 
        ? 'http://localhost:5260/api/visitors/alerts/geofence'
        : 'http://localhost:5260/api/visitors/alerts';
      
      const response = await fetch(`${endpoint}?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'geofence_violation':
        return 'border-red-200 bg-red-50';
      case 'restricted_zone_entry':
        return 'border-orange-200 bg-orange-50';
      case 'unknown_person':
        return 'border-yellow-200 bg-yellow-50';
      case 're_entry_without_exit':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'geofence_violation':
        return <MapPin className="w-5 h-5 text-red-600" />;
      case 'restricted_zone_entry':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'unknown_person':
        return <User className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatAlertType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header 
            title="Security Alerts" 
            subtitle="Real-time alerts from AI monitoring system" 
          />

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: 'All Alerts' },
              { key: 'geofence', label: 'Geofence Violations' },
              { key: 'restricted', label: 'Restricted Zone' },
              { key: 'unknown', label: 'Unknown Persons' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.key
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            
            <button
              onClick={fetchAlerts}
              className="ml-auto px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {loading && alerts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading alerts...
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No alerts found</p>
                <p className="text-sm text-gray-400 mt-1">System is monitoring. Alerts will appear here.</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${getAlertColor(alert.event_type)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.event_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          {formatAlertType(alert.event_type)}
                        </h3>
                        <span className="px-2 py-0.5 bg-white rounded text-xs font-medium text-gray-600">
                          {alert.visitor_id}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>{alert.name || 'Unknown'}</strong> detected at {alert.location}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" />
                          {alert.camera_id}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimestamp(alert.timestamp)}
                        </div>
                        {alert.duration_seconds && (
                          <div className="text-red-600 font-medium">
                            Duration: {alert.duration_seconds}s
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {alert.confidence && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Confidence</div>
                        <div className="text-sm font-bold text-gray-900">
                          {(alert.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlertsDashboard;
