import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import { Camera, Play, Square, Trash2, Plus, MapPin, Activity, X, Crosshair } from 'lucide-react';

const AdminCameraManagement = () => {
  const [cameras, setCameras] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCamera, setNewCamera] = useState({
    camera_id: '', source_value: 1, location: '', zone_type: 'general',
  });

  useEffect(() => {
    fetchCameras();
    fetchStats();
    const interval = setInterval(() => { fetchCameras(); fetchStats(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('http://localhost:5260/api/cameras/list');
      if (response.ok) {
        const data = await response.json();
        setCameras(data.cameras || []);
      }
    } catch (error) { console.error('Failed to fetch cameras:', error); }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5260/api/visitors/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) { console.error('Failed to fetch stats:', error); }
  };

  const registerCamera = async () => {
    if (!newCamera.camera_id || !newCamera.location) return alert('Camera ID and Location are required');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5260/api/cameras/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCamera, source_type: 'webcam', target_fps: 3 }),
      });
      if (response.ok) {
        alert('Camera registered successfully');
        setShowAddForm(false);
        setNewCamera({ camera_id: '', source_value: 1, location: '', zone_type: 'general' });
        fetchCameras();
      } else { alert('Failed to register camera.'); }
    } catch (error) { alert('Error: ' + error.message); } 
    finally { setLoading(false); }
  };

  const startCamera = async (cameraId) => {
    try {
      const res = await fetch(`http://localhost:5260/api/cameras/${cameraId}/start-processing`, { method: 'POST' });
      if (res.ok) { fetchCameras(); } 
      else { alert(`Failed to start AI.`); }
    } catch (error) { alert('Error communicating with AI Service.'); }
  };

  const stopCamera = async (cameraId) => {
    try {
      const res = await fetch(`http://localhost:5260/api/cameras/${cameraId}/stop-processing`, { method: 'POST' });
      if (res.ok) { fetchCameras(); } 
    } catch (error) { alert('Error communicating with AI Service.'); }
  };

  const deleteCamera = async (cameraId) => {
    if (!window.confirm(`Permanently delete camera "${cameraId}" and its geofence boundaries?`)) return;
    try {
      const res = await fetch(`http://localhost:5260/api/cameras/${cameraId}`, { method: 'DELETE' });
      if (res.ok) {
        setCameras(prev => prev.filter(c => c.camera_id !== cameraId));
      } else { alert('Failed to delete camera!'); }
    } catch (error) { alert('Error communicating with backend.'); }
  };

  const launchBoundarySetup = async (cameraId, source) => {
    try {
      // Calls Python directly through C# to pop up the desktop drawing window
      const res = await fetch(`http://localhost:5260/api/cameras/${cameraId}/launch-boundary-setup?source=${source}`, { method: 'POST' });
      if (res.ok) {
        alert("Drawing window is opening! Check your desktop/taskbar.");
        fetchCameras(); 
      } else { alert("Failed to launch setup tool."); }
    } catch (error) { alert("Error communicating with backend."); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header title="AI Camera Management" subtitle="Register and manage security feed AI processing" />

          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_cameras || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">Active Cameras</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.enrolled_visitors || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">Enrolled Faces</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_alerts || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">Total Alerts</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.registered_cameras || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">Total Cameras</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <Button onClick={() => setShowAddForm(!showAddForm)} icon={showAddForm ? X : Plus} className={showAddForm ? "bg-gray-500 hover:bg-gray-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}>
              {showAddForm ? 'Cancel Registration' : 'Register New Camera'}
            </Button>
          </div>

          {showAddForm && (
            <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Register New Camera Feed</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input label="Camera ID (Unique)" placeholder="e.g., entrance_cam_01" value={newCamera.camera_id} onChange={(e) => setNewCamera({ ...newCamera, camera_id: e.target.value.replace(/\s+/g, '_') })} icon={Camera} required />
                <Input label="Physical Location" placeholder="e.g., Main Entrance Lobby" value={newCamera.location} onChange={(e) => setNewCamera({ ...newCamera, location: e.target.value })} icon={MapPin} required />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hardware Source Index</label>
                  <select value={newCamera.source_value} onChange={(e) => setNewCamera({ ...newCamera, source_value: parseInt(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value={0}>Index 0 (Built-in Laptop Cam)</option>
                    <option value={1}>Index 1 (USB Web Cam)</option>
                    <option value={2}>Index 2 (External Cam 2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Security Zone Type</label>
                  <select value={newCamera.zone_type} onChange={(e) => setNewCamera({ ...newCamera, zone_type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="general">General Area (Standard Monitoring)</option>
                    <option value="restricted">Restricted Area (High Security)</option>
                  </select>
                </div>
              </div>
              <Button onClick={registerCamera} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                {loading ? 'Registering to AI Service...' : 'Confirm & Register Camera'}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {cameras.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No cameras registered yet.</p>
              </div>
            ) : (
              cameras.map((camera) => (
                <div key={camera.camera_id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${camera.active ? 'bg-green-100 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
                      <Camera className={`w-7 h-7 ${camera.active ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5">{camera.camera_id}</h3>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {camera.location} (Source: {camera.source_value})
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-bold ${camera.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {camera.active ? '● Processing Active' : '○ Feed Offline'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full font-bold ${camera.zone_type === 'restricted' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {camera.zone_type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {camera.active ? (
                      <button onClick={() => stopCamera(camera.camera_id)} className="px-5 py-2.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors">
                        <Square className="w-4 h-4" /> Stop AI
                      </button>
                    ) : (
                      <button onClick={() => startCamera(camera.camera_id)} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-sm">
                        <Play className="w-4 h-4" /> Start AI
                      </button>
                    )}

                    {/* NEW BOUNDARY BUTTON */}
                    <button 
                      onClick={() => launchBoundarySetup(camera.camera_id, camera.source_value)}
                      disabled={camera.active}
                      title={camera.active ? "Stop AI first to draw boundary" : "Draw Geofence Boundary"}
                      className="px-4 py-2.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Crosshair className="w-4 h-4"/> Draw Geofence
                    </button>

                    <button
                      onClick={() => deleteCamera(camera.camera_id)}
                      disabled={camera.active}
                      title={camera.active ? "Stop AI processing before deleting" : "Delete Camera"}
                      className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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

export default AdminCameraManagement;