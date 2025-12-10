"use client"

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import useUser from "@/hooks/useUser";
import { toast } from "sonner";
import useTours, { Tour, Step } from "@/hooks/useTours";
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
  AlertCircle,
  Loader2,
} from "lucide-react";

interface NewTour {
  name: string;
  description: string;
  steps: Array<{
    title: string;
    description: string;
    targetSelector: string;
    position: string;
    order: number;
  }>;
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  change: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"tours" | "analytics" | "settings">("tours");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [tourStats, setTourStats] = useState<Record<string, any>>({});
  
  const user = useUser();
  const { tours, loading, error, createTour, updateTour, updateTourSteps, deleteTour, fetchTourStats } = useTours();

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "");
    toast.success("API key copied");
  };

  const initialSteps = Array(5)
    .fill(null)
    .map((_, i) => ({
      title: "",
      description: "",
      targetSelector: "",
      position: "bottom",
      order: i,
    }));

  const [newTour, setNewTour] = useState<NewTour>({
    name: "",
    description: "",
    steps: initialSteps,
  });

  const [editTourData, setEditTourData] = useState<NewTour>({
    name: "",
    description: "",
    steps: initialSteps,
  });

  // Fetch stats for all tours
  useEffect(() => {
    const loadStats = async () => {
      const statsMap: Record<string, any> = {};
      for (const tour of tours) {
        const stats = await fetchTourStats(tour.id);
        statsMap[tour.id] = stats;
      }
      setTourStats(statsMap);
    };
    if (tours.length > 0) loadStats();
  }, [tours, fetchTourStats]);

  const stats: StatItem[] = [
    { 
      label: "Total Tours", 
      value: tours.length.toString(), 
      icon: <PlayCircle className="w-5 h-5" />, 
      change: `${tours.filter(t => t.is_public).length} active` 
    },
    { 
      label: "Total Views", 
      value: Object.values(tourStats).reduce((sum: number, s: any) => sum + (s?.views || 0), 0).toLocaleString(), 
      icon: <Users className="w-5 h-5" />, 
      change: "Across all tours" 
    },
    { 
      label: "Avg Completion", 
      value: tours.length > 0 
        ? `${Math.round(Object.values(tourStats).reduce((sum: number, s: any) => sum + (s?.completionRate || 0), 0) / Object.keys(tourStats).length || 0)}%`
        : "0%", 
      icon: <TrendingUp className="w-5 h-5" />, 
      change: "Overall performance" 
    },
    { 
      label: "Active Tours", 
      value: tours.filter(t => t.is_public).length.toString(), 
      icon: <Eye className="w-5 h-5" />, 
      change: `${tours.filter(t => !t.is_public).length} paused` 
    },
  ];

  const handleCreateTour = async () => {
    if (!newTour.name || newTour.steps.filter(s => s.title).length < 5) {
      toast.error("Please provide a tour name and at least 5 steps with titles.");
      return;
    }

    try {
      await createTour({
        name: newTour.name,
        description: newTour.description,
        isActive: true,
        steps: newTour.steps.filter(s => s.title),
      });
      toast.success("Tour created successfully!");
      setShowCreateModal(false);
      setNewTour({ name: "", description: "", steps: initialSteps });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create tour.");
    }
  };

const openEditModal = (tour: Tour) => {
  setEditingTour(tour);
  setEditTourData({
    name: tour.title,
    description: tour.description,
    steps: tour.steps && tour.steps.length > 0  // Fixed: added && check
      ? tour.steps.map((step, index) => ({
          title: step.title,
          description: step.content || "",
          targetSelector: step.target_selector || "",
          position: step.position || "bottom",
          order: index,
        }))
      : initialSteps,
  });
  setShowEditModal(true);
}

 const handleEditTour = async () => {
  if (!editingTour || !editTourData.name || editTourData.steps.filter(s => s.title).length < 5) {
    toast.error("Please provide a tour name and at least 5 steps with titles.");
    return;
  }

  try {
    await updateTour(editingTour.id, {
      title: editTourData.name, 
      description: editTourData.description,
    });

    await updateTourSteps(editingTour.id, editTourData.steps.filter(s => s.title));

    toast.success("Tour updated successfully!");
    setShowEditModal(false);
    setEditingTour(null);
    setEditTourData({ name: "", description: "", steps: initialSteps });
  } catch (err) {
    console.error(err);
    toast.error("Failed to update tour.");
  }
};

  const handleDeleteTour = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;
    try {
      await deleteTour(id);
      toast.success("Tour deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete tour.");
    }
  };

  const toggleTourStatus = async (tour: Tour) => {
    try {
      await updateTour(tour.id, { is_public: !tour.is_public });
      toast.success(`Tour ${!tour.is_public ? 'activated' : 'paused'}!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update tour status.");
    }
  };

  const copyEmbedCode = async (tourId: string, slug: string) => {
    const code = `<script src="https://cdn.tourguide.com/widget.js"></script>
<script>
  TourGuide.init({
    tourId: '${tourId}',
    slug: '${slug}',
    apiKey: '${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY}'
  });
</script>`;

    await navigator.clipboard.writeText(code);
    toast.success("Embed code copied to clipboard!");
  };

  const addStep = () => {
    setNewTour((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          title: "",
          description: "",
          targetSelector: "",
          position: "bottom",
          order: prev.steps.length,
        },
      ],
    }));
  };

  const addEditStep = () => {
    setEditTourData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          title: "",
          description: "",
          targetSelector: "",
          position: "bottom",
          order: prev.steps.length,
        },
      ],
    }));
  };

  const updateStep = (index: number, field: string, value: string | number) => {
    const updated = [...newTour.steps];
    updated[index] = { ...updated[index], [field]: value };
    setNewTour({ ...newTour, steps: updated });
  };

  const updateEditStep = (index: number, field: string, value: string | number) => {
    const updated = [...editTourData.steps];
    updated[index] = { ...updated[index], [field]: value };
    setEditTourData({ ...editTourData, steps: updated });
  };

  const removeStep = (index: number) => {
    if (newTour.steps.length > 5) {
      setNewTour({
        ...newTour,
        steps: newTour.steps.filter((_, i) => i !== index),
      });
    }
  };

  const removeEditStep = (index: number) => {
    if (editTourData.steps.length > 5) {
      setEditTourData({
        ...editTourData,
        steps: editTourData.steps.filter((_, i) => i !== index),
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your tours...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Error Loading Tours</h2>
          <p className="text-slate-600 mb-4 text-center">{error}</p>
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-slate-900 mb-2">Quick fixes to try:</p>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Check if Supabase tables exist: tours, tour_steps</li>
              <li>Verify RLS policies allow user access</li>
              <li>Confirm environment variables are set</li>
              <li>Check browser console for detailed errors</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 z-40">
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
            <div className="font-semibold truncate">{user?.email || "Loading..."}</div>
            <button
              className="text-sm text-purple-400 hover:text-purple-300 mt-2"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content  */}
      <div className=" p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage your onboarding tours and track performance</p>
        </div>

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

            {tours.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <PlayCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No tours yet</h3>
                <p className="text-slate-600 mb-6">Create your first onboarding tour to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Tour
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tours.map((tour) => {
                  const stats = tourStats[tour.id] || { views: 0, completions: 0, completionRate: 0 };
                  return (
                    <div key={tour.id} className="bg-white rounded-xl border border-slate-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-slate-900">{tour.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              tour.is_public 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {tour.is_public ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          <p className="text-slate-600 mb-4">{tour.description}</p>
                          
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-slate-500">Steps</div>
                              <div className="text-lg font-semibold text-slate-900">{tour.steps?.length || 0}</div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-500">Views</div>
                              <div className="text-lg font-semibold text-slate-900">{stats.views.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-500">Completions</div>
                              <div className="text-lg font-semibold text-slate-900">{stats.completions.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-500">Rate</div>
                              <div className="text-lg font-semibold text-green-600">{stats.completionRate}%</div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => openEditModal(tour)}
                              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm transition"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => copyEmbedCode(tour.id, tour.slug)}
                              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm transition"
                            >
                              <Copy className="w-4 h-4" />
                              Copy Code
                            </button>
                            <button
                              onClick={() => toggleTourStatus(tour)}
                              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm transition"
                            >
                              {tour.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              {tour.is_public ? 'Pause' : 'Activate'}
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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Analytics Overview</h2>
            {tours.length === 0 ? (
              <p className="text-slate-600 text-center py-12">Create tours to see analytics</p>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Top Performing Tours</h3>
                  <div className="space-y-3">
                    {tours.map((tour) => {
                      const stats = tourStats[tour.id] || { completionRate: 0 };
                      return (
                        <div key={tour.id} className="flex justify-between items-center">
                          <span className="text-slate-900">{tour.title}</span>
                          <span className="font-semibold text-green-600">{stats.completionRate}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  User ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={user?.id || ""}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user?.id || "");
                      toast.success("User ID copied");
                    }}
                    className="px-3 py-2 bg-slate-900 text-white rounded hover:bg-slate-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ""}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                  />
                  <button 
                    className="px-3 py-2 bg-slate-900 text-white rounded hover:bg-slate-800" 
                    onClick={copyApiKey}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Tour Modal*/}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
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
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
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
                          <label className="block text-sm text-slate-600 mb-1">Title *</label>
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

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3 justify-end z-10">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-slate-300 hover:bg-slate-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTour}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newTour.name || newTour.steps.filter(s => s.title).length < 5}
              >
                Create Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tour Modal */}
      {showEditModal && editingTour && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
              <h2 className="text-2xl font-bold text-slate-900">Edit Tour</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2"></label>
                <input
                  type="text"
                  value={editTourData.name}
                  onChange={(e) => setEditTourData({ ...editTourData, name: e.target.value })}
                  placeholder="Welcome Tour"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
              </div>
              <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Description
            </label>
            <textarea
              value={editTourData.description}
              onChange={(e) => setEditTourData({ ...editTourData, description: e.target.value })}
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
                onClick={addEditStep}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            <div className="space-y-4">
              {editTourData.steps.map((step, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-slate-900">Step {index + 1}</h4>
                    {editTourData.steps.length > 5 && (
                      <button
                        onClick={() => removeEditStep(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Title *</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateEditStep(index, 'title', e.target.value)}
                        placeholder="Step title"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Target Selector</label>
                      <input
                        type="text"
                        value={step.targetSelector}
                        onChange={(e) => updateEditStep(index, 'targetSelector', e.target.value)}
                        placeholder="#element-id or .class-name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm text-slate-600 mb-1">Description</label>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateEditStep(index, 'description', e.target.value)}
                      placeholder="Explain this step"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm text-slate-600 mb-1">Position</label>
                    <select
                      value={step.position}
                      onChange={(e) => updateEditStep(index, 'position', e.target.value)}
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

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3 justify-end z-10">
          <button
            onClick={() => {
              setShowEditModal(false);
              setEditingTour(null);
            }}
            className="px-6 py-3 border border-slate-300 hover:bg-slate-50 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleEditTour}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!editTourData.name || editTourData.steps.filter(s => s.title).length < 5}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
}