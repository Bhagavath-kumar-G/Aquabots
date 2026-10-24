import type { Incident, IncidentStatus, IncidentCategory, RoadClosureItem, PanchayatAnalyticsData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[API Offline Fallback] ${endpoint}:`, err.message);
      return null;
    }
  }

  // Complaints
  async getComplaints(filter?: { status?: string; category?: string; ward?: string }): Promise<Incident[] | null> {
    const params = new URLSearchParams();
    if (filter?.status && filter.status !== 'All') params.append('status', filter.status);
    if (filter?.category && filter.category !== 'All') params.append('category', filter.category);
    if (filter?.ward && filter.ward !== 'All') params.append('ward', filter.ward);
    const query = params.toString() ? `?${params.toString()}` : '';
    
    const res = await this.request<{ success: boolean; data: any[] }>(`/complaints${query}`);
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map(this.mapBackendComplaintToIncident);
    }
    return null;
  }

  async submitComplaint(formData: FormData): Promise<{ success: boolean; data?: Incident; duplicateAlert?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Submission failed' };
      }
      return {
        success: true,
        data: this.mapBackendComplaintToIncident(data.data),
        duplicateAlert: data.duplicateAlert
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend' };
    }
  }

  async updateComplaintStatus(params: {
    id: string;
    newStatus: IncidentStatus;
    author: string;
    note?: string;
    verifiedBy?: string;
    resolutionNote?: string;
    resolutionPhoto?: File;
  }): Promise<{ success: boolean; data?: Incident; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('newStatus', params.newStatus);
      formData.append('author', params.author);
      if (params.note) formData.append('note', params.note);
      if (params.verifiedBy) formData.append('verifiedBy', params.verifiedBy);
      if (params.resolutionNote) formData.append('resolutionNote', params.resolutionNote);
      if (params.resolutionPhoto) formData.append('resolutionPhoto', params.resolutionPhoto);

      const response = await fetch(`${API_BASE_URL}/complaints/${params.id}/status`, {
        method: 'PATCH',
        body: formData
      });

      const res = await response.json();
      if (!response.ok) {
        return { success: false, error: res.error || 'Status update failed' };
      }
      return { success: true, data: this.mapBackendComplaintToIncident(res.data) };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }

  async assignCrew(id: string, assignedTeam: string, dispatcherName: string, note?: string): Promise<{ success: boolean; data?: Incident; error?: string }> {
    const res = await this.request<{ success: boolean; data: any; error?: string }>(`/complaints/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTeam, dispatcherName, dispatchNote: note })
    });
    if (res?.success && res.data) {
      return { success: true, data: this.mapBackendComplaintToIncident(res.data) };
    }
    return { success: false, error: res?.error || 'Failed to assign unit' };
  }

  async confirmCategory(id: string, confirmedCategory: IncidentCategory, reviewerName: string, note?: string): Promise<{ success: boolean; data?: Incident; error?: string }> {
    const res = await this.request<{ success: boolean; data: any; error?: string }>(`/complaints/${id}/confirm-category`, {
      method: 'POST',
      body: JSON.stringify({ confirmedCategory, reviewerName, note })
    });
    if (res?.success && res.data) {
      return { success: true, data: this.mapBackendComplaintToIncident(res.data) };
    }
    return { success: false, error: res?.error || 'Failed to confirm category' };
  }

  async handleDuplicateAction(id: string, action: 'Merge' | 'Dismiss', reviewerName: string, note?: string): Promise<{ success: boolean; data?: Incident; error?: string }> {
    const res = await this.request<{ success: boolean; data: any; error?: string }>(`/complaints/${id}/duplicate-action`, {
      method: 'POST',
      body: JSON.stringify({ action, reviewerName, note })
    });
    if (res?.success && res.data) {
      return { success: true, data: this.mapBackendComplaintToIncident(res.data) };
    }
    return { success: false, error: res?.error || 'Action failed' };
  }

  // IoT Sensors
  async getSensorReadings(deviceId?: string): Promise<any[] | null> {
    const query = deviceId ? `?deviceId=${deviceId}` : '';
    const res = await this.request<{ success: boolean; data: any[] }>(`/sensors/readings${query}`);
    return res?.data || null;
  }

  async simulateSensorReading(scenario: 'flash_flood' | 'receding' | 'sensor_glitch'): Promise<any | null> {
    const res = await this.request<{ success: boolean; data: any; notice: string }>(`/sensors/simulate`, {
      method: 'POST',
      body: JSON.stringify({ scenario })
    });
    return res || null;
  }

  // Road Closures
  async getRoadClosures(): Promise<RoadClosureItem[] | null> {
    const res = await this.request<{ success: boolean; data: RoadClosureItem[] }>(`/hazards/road-closures`);
    return res?.data || null;
  }

  // Panchayat Analytics
  async getPanchayatAnalytics(): Promise<PanchayatAnalyticsData | null> {
    const res = await this.request<PanchayatAnalyticsData>(`/analytics/panchayat`);
    return res || null;
  }

  private mapBackendComplaintToIncident(item: any): Incident {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      confirmedCategory: item.confirmedCategory,
      severity: item.priorityScore >= 75 ? 'Critical' : item.priorityScore >= 50 ? 'High' : item.priorityScore >= 30 ? 'Medium' : 'Low',
      status: item.status,
      lat: item.lat,
      lng: item.lng,
      locationName: item.locationName,
      ward: item.panchayatWard || 'Ward Unassigned',
      waterDepthMeters: item.waterDepthMeters || 0,
      trappedCount: item.category === 'Trapped Citizens' ? 2 : 0,
      hazards: item.aiSuggestion?.detectedKeywords || ['Stormwater Surge'],
      imageUrl: item.photoUrl 
        ? (item.photoUrl.startsWith('http') ? item.photoUrl : `${API_BASE_URL.replace('/api', '')}${item.photoUrl}`)
        : '/images/drainpulse/drain_inspection_waste.jpg',
      reportedAt: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      source: 'Citizen Report',
      priorityReason: item.priorityReason || `Priority score: ${item.priorityScore}/100`,
      safetyGuidelines: [
        'Coordinate field inspection with Panchayat Sanitation Ward.',
        'Avoid contact with stagnant water without insulated boots.',
        'Keep emergency helpline numbers (1070/112) accessible.'
      ],
      assignedTeam: item.assignedTeam,
      dispatchPriorityScore: item.priorityScore || 50,
      history: (item.auditTrail || []).map((a: any) => ({
        timestamp: a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        fromStatus: a.fromStatus,
        status: a.toStatus || a.status,
        note: a.note,
        author: a.author,
        evidenceUrl: a.evidenceUrl
      })),
      verifiedByAi: item.aiSuggestion ? item.aiSuggestion.confidence > 0.75 : false,
      reporterContact: item.reporterContact,
      reporterName: item.reporterName,
      aiSuggestion: item.aiSuggestion,
      duplicateFlag: item.duplicateFlag,
      resolutionEvidence: item.resolutionEvidence
    };
  }
}

export const apiService = new ApiService();
