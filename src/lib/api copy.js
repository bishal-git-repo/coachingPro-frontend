const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() { this.baseUrl = BASE_URL; }

  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  setTokens(access, refresh) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    if (options.body instanceof FormData) delete headers['Content-Type'];

    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      if (data.code === 'TOKEN_EXPIRED') {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) return this.request(endpoint, options);
      }
      this.clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error(data.message || 'Unauthorized');
    }

    // Blob response for downloads
    if (options._blob) {
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      return response.blob();
    }

    const data = await response.json().catch(() => ({ success: false, message: 'Invalid response' }));
    if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
    return data;
  }

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch { return false; }
  }

  get(endpoint, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`${endpoint}${qs ? '?' + qs : ''}`);
  }
  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });
  }
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  patch(endpoint, body) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
  download(endpoint) { return this.request(endpoint, { _blob: true }); }

  // Upload with progress
  uploadMaterial(formData, onProgress) {
    return new Promise((resolve, reject) => {
      const token = this.getToken();
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.baseUrl}/materials`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100)); };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) resolve(data);
          else reject(new Error(data.message || 'Upload failed'));
        } catch { reject(new Error('Upload failed')); }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  }

  // ── Auth ──────────────────────────────────────────────────
  adminRegister(data) { return this.post('/auth/admin/register', data); }
  adminLogin(data) { return this.post('/auth/admin/login', data); }
  teacherLogin(data) { return this.post('/auth/teacher/login', data); }
  studentLogin(data) { return this.post('/auth/student/login', data); }
  logout() { return this.post('/auth/logout', {}); }
  getMe() { return this.get('/auth/me'); }
  changePassword(data) { return this.put('/auth/change-password', data); }

  // ── Dashboard ─────────────────────────────────────────────
  getAdminDashboard() { return this.get('/dashboard/admin'); }
  getTeacherDashboard() { return this.get('/dashboard/teacher'); }
  getStudentDashboard() { return this.get('/dashboard/student'); }

  // ── Students ──────────────────────────────────────────────
  getStudents(params) { return this.get('/students', params); }
  getStudent(id) { return this.get(`/students/${id}`); }
  createStudent(data) { return this.post('/students', data); }
  updateStudent(id, data) { return this.put(`/students/${id}`, data); }
  deleteStudent(id) { return this.delete(`/students/${id}`); }
  toggleStudentStatus(id) { return this.patch(`/students/${id}/toggle-status`, {}); }
  resendStudentCredentials(id) { return this.post(`/students/${id}/resend-credentials`, {}); }

  // ── Teachers ──────────────────────────────────────────────
  getTeachers(params) { return this.get('/teachers', params); }
  getTeacher(id) { return this.get(`/teachers/${id}`); }
  createTeacher(data) { return this.post('/teachers', data); }
  updateTeacher(id, data) { return this.put(`/teachers/${id}`, data); }
  deleteTeacher(id) { return this.delete(`/teachers/${id}`); }
  toggleTeacherStatus(id) { return this.patch(`/teachers/${id}/toggle-status`, {}); }
  resendTeacherCredentials(id) { return this.post(`/teachers/${id}/resend-credentials`, {}); }

  // ── Classes ───────────────────────────────────────────────
  getClasses() { return this.get('/classes'); }
  getClass(id) { return this.get(`/classes/${id}`); }
  createClass(data) { return this.post('/classes', data); }
  updateClass(id, data) { return this.put(`/classes/${id}`, data); }
  deleteClass(id) { return this.delete(`/classes/${id}`); }

  // ── Batches ───────────────────────────────────────────────
  getBatches(params) { return this.get('/batches', params); }
  getBatch(id) { return this.get(`/batches/${id}`); }
  createBatch(data) { return this.post('/batches', data); }
  updateBatch(id, data) { return this.put(`/batches/${id}`, data); }
  deleteBatch(id) { return this.delete(`/batches/${id}`); }
  assignStudentToBatch(data) { return this.post('/batches/assign-student', data); }
  removeStudentFromBatch(data) { return this.post('/batches/remove-student', data); }
  assignTeacherToBatch(data) { return this.post('/batches/assign-teacher', data); }
  removeTeacherFromBatch(data) { return this.post('/batches/remove-teacher', data); }

  getMyBatches() { return this.get('/my-batches'); }

  // ── Schedule ──────────────────────────────────────────────
  getScheduledClasses(params) { return this.get('/attendance/scheduled', params); }
  createScheduledClass(data) { return this.post('/attendance/scheduled', data); }
  updateScheduledClass(id, data) { return this.put(`/attendance/scheduled/${id}`, data); }
  deleteScheduledClass(id) { return this.delete(`/attendance/scheduled/${id}`); }

  // ── Attendance ────────────────────────────────────────────
  getSessionAttendance(sessionId) { return this.get(`/attendance/session/${sessionId}`); }
  markAttendance(data) { return this.post('/attendance/mark', data); }

  // ── Fees ──────────────────────────────────────────────────
  getFees(params) { return this.get('/fees', params); }
  createFee(data) { return this.post('/fees', data); }
  getFeesAnalytics() { return this.get('/fees/analytics'); }
  createBulkFees(data) { return this.post('/fees/bulk', data); }
  markFeePaid(id, data) { return this.patch(`/fees/${id}/mark-paid`, data); }
  deleteFee(id) { return this.delete(`/fees/${id}`); }
  emailFeeSlip(id) { return this.post(`/fees/${id}/send-slip`, {}); }
  downloadFeeSlip(id) { return this.download(`/fees/${id}/download-slip`); }
  createRazorpayOrder(data) { return this.post('/fees/razorpay/order', data); }
  verifyRazorpayPayment(data) { return this.post('/fees/razorpay/verify', data); }

  // ── Teacher Payments ──────────────────────────────────────
  getTeacherPayments(params) { return this.get('/teacher-payments', params); }
  addTeacherPayment(data) { return this.post('/teacher-payments', data); }

  // ── Materials ─────────────────────────────────────────────
  getMaterials(params) { return this.get('/materials', params); }
  getMaterial(id) { return this.get(`/materials/${id}`); }
  deleteMaterial(id) { return this.delete(`/materials/${id}`); }

  // ── Plan ──────────────────────────────────────────────────
  createPlanOrder() { return this.post('/plan/order', {}); }
  verifyPlanPayment(data) { return this.post('/plan/verify', data); }
}

const api = new ApiClient();
export default api;
