"use client"

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  BarChart3,
  Eye,
  EyeOff,
  Settings,
  PlayCircle,
  Users,
  TrendingUp,
} from "lucide-react";

// ==========================
// Types
// ==========================
interface Step {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: string;
}

interface Tour {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: number;
  views: number;
  completions: number;
  completionRate: number;
}

interface NewTour {
  name: string;
  description: string;
  steps: Step[];
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  change: string;
}

// ==========================
// Main Component
// ==========================
export default function AnalyticsView() {
  const [activeTab, setActiveTab] = useState<"tours" | "analytics" | "settings">("tours");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  const [tours, setTours] = useState<Tour[]>([
    {
      id: "1",
      name: "Welcome Tour",
      description: "Introduce new users to main features",
      isActive: true,
      steps: 5,
      views: 1234,
      completions: 892,
      completionRate: 72,
    },
    {
      id: "2",
      name: "Feature Spotlight",
      description: "Highlight premium features",
      isActive: false,
      steps: 7,
      views: 567,
      completions: 423,
      completionRate: 75,
    },
  ]);

  const initialSteps = Array(5)
    .fill(null)
    .map((_, i) => ({
      id: (i + 1).toString(),
      title: "",
      description: "",
      targetSelector: "",
      position: "bottom",
    }));

  const [newTour, setNewTour] = useState<NewTour>({
    name: "",
    description: "",
    steps: initialSteps,
  });

  const stats: StatItem[] = [
    { label: "Total Tours", value: "12", icon: <PlayCircle />, change: "+2 this week" },
    { label: "Total Views", value: "45.2K", icon: <Users />, change: "+12% from last month" },
    { label: "Avg Completion", value: "68%", icon: <TrendingUp />, change: "+5% improvement" },
    { label: "Active Tours", value: "8", icon: <Eye />, change: "4 paused" },
  ];

  // ==========================
  // Handlers
  // ==========================
  const handleCreateTour = () => {
    const stepsCount = newTour.steps.filter((s) => s.title.trim()).length;

    const tour: Tour = {
      id: Date.now().toString(),
      name: newTour.name.trim(),
      description: newTour.description.trim(),
      isActive: true,
      steps: stepsCount,
      views: 0,
      completions: 0,
      completionRate: 0,
    };

    setTours([...tours, tour]);
    setShowCreateModal(false);

    setNewTour({
      name: "",
      description: "",
      steps: initialSteps,
    });
  };

  const handleDeleteTour = (id: string) => {
    setTours(tours.filter((t) => t.id !== id));
  };

  const toggleTourStatus = (id: string) => {
    setTours(
      tours.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  const copyEmbedCode = async (tourId: string) => {
    const code = `
<script src="https://cdn.tourguide.com/widget.js"></script>
<script>
  TourGuide.init({
    tourId: '${tourId}',
    apiKey: 'your_api_key'
  });
</script>`;

    await navigator.clipboard.writeText(code);
    alert("Embed code copied to clipboard!");
  };

  const addStep = () => {
    setNewTour((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: (prev.steps.length + 1).toString(),
          title: "",
          description: "",
          targetSelector: "",
          position: "bottom",
        },
      ],
    }));
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    const updated = [...newTour.steps];
    updated[index] = { ...updated[index], [field]: value };
    setNewTour({ ...newTour, steps: updated });
  };

  const removeStep = (index: number) => {
    if (newTour.steps.length > 5) {
      setNewTour({
        ...newTour,
        steps: newTour.steps.filter((_, i) => i !== index),
      });
    }
  };

  // ==========================
  // UI
  // ==========================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6">
        <div className="text-2xl font-bold mb-8 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          TourGuide
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('tours')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeTab === 'tours' ? 'bg-purple-600' : 'hover:bg-slate-800'
            }`}
          >
            <PlayCircle className="inline w-5 h-5 mr-3" />
            Tours
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeTab === 'analytics' ? 'bg-purple-600' : 'hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="inline w-5 h-5 mr-3" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeTab === 'settings' ? 'bg-purple-600' : 'hover:bg-slate-800'
            }`}
          >
            <Settings className="inline w-5 h-5 mr-3" />
            Settings
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Signed in as</div>
            <div className="font-semibold">user@example.com</div>
            <button className="text-sm text-purple-400 hover:text-purple-300 mt-2">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage your onboarding tours and track performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-slate-600">{stat.icon}</div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </div>
              <div className="text-sm font-medium text-slate-900 mb-1">{stat.label}</div>
              <div className="text-xs text-green-600">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Tours Tab */}
        {activeTab === 'tours' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Your Tours</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Create Tour
              </button>
            </div>

            <div className="space-y-4">
              {tours.map((tour) => (
                <div key={tour.id} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">{tour.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tour.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {tour.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4">{tour.description}</p>
                      
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-slate-500">Steps</div>
                          <div className="text-lg font-semibold text-slate-900">{tour.steps}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Views</div>
                          <div className="text-lg font-semibold text-slate-900">{tour.views.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Completions</div>
                          <div className="text-lg font-semibold text-slate-900">{tour.completions.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Rate</div>
                          <div className="text-lg font-semibold text-green-600">{tour.completionRate}%</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditingTour(tour)}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm transition"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => copyEmbedCode(tour.id)}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm transition"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Code
                        </button>
                        <button
                          onClick={() => toggleTourStatus(tour.id)}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm transition"
                        >
                          {tour.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {tour.isActive ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteTour(tour.id)}
                          className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 text-sm transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Analytics Overview</h2>
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-6">
                <h3 className="font-semibold text-slate-900 mb-4">Completion Funnel</h3>
                <div className="space-y-3">
                  {['Started Tour', 'Step 2', 'Step 3', 'Step 4', 'Completed'].map((step, index) => {
                    const percentage = 100 - (index * 15);
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{step}</span>
                          <span className="font-medium text-slate-900">{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className="bg-purple-600 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Top Performing Tours</h3>
                <div className="space-y-3">
                  {tours.map((tour) => (
                    <div key={tour.id} className="flex justify-between items-center">
                      <span className="text-slate-900">{tour.name}</span>
                      <span className="font-semibold text-green-600">{tour.completionRate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value="pk_live_xxxxxxxxxxxxxxxx"
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Widget CDN URL
                </label>
                <input
                  type="text"
                  value="https://cdn.tourguide.com/widget.js"
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Tour Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900">Create New Tour</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Tour Name *
                </label>
                <input
                  type="text"
                  value={newTour.name}
                  onChange={(e) => setNewTour({ ...newTour, name: e.target.value })}
                  placeholder="Welcome Tour"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  value={newTour.description}
                  onChange={(e) => setNewTour({ ...newTour, description: e.target.value })}
                  placeholder="Introduce new users to main features"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Steps (Minimum 5)
                  </h3>
                  <button
                    onClick={addStep}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm flex items-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </button>
                </div>

                <div className="space-y-4">
                  {newTour.steps.map((step, index) => (
                    <div key={step.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-slate-900">Step {index + 1}</h4>
                        {newTour.steps.length > 5 && (
                          <button
                            onClick={() => removeStep(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => updateStep(index, 'title', e.target.value)}
                            placeholder="Step title"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Target Selector</label>
                          <input
                            type="text"
                            value={step.targetSelector}
                            onChange={(e) => updateStep(index, 'targetSelector', e.target.value)}
                            placeholder="#element-id or .class-name"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-slate-600 mb-1">Description</label>
                        <textarea
                          value={step.description}
                          onChange={(e) => updateStep(index, 'description', e.target.value)}
                          placeholder="Explain this step"
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm text-slate-600 mb-1">Position</label>
                        <select
                          value={step.position}
                          onChange={(e) => updateStep(index, 'position', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-slate-300 hover:bg-slate-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTour}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                disabled={!newTour.name || newTour.steps.filter(s => s.title).length < 5}
              >
                Create Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
