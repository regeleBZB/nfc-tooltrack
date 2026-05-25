
const BASE = '/api';
─
export const getToken  = ()    => sessionStorage.getItem('auth_token');
export const setToken  = (tok) => sessionStorage.setItem('auth_token', tok);
export const clearToken= ()    => sessionStorage.removeItem('auth_token');

function authHeaders() {
  const tok = getToken();
  return tok
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }
    : { 'Content-Type': 'application/json' };
}

async function request(method, path, body) {
  const res  = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json; // { success, data, message, timestamp }
}
export const AuthAPI = {
  login: (username, password) =>
    request('POST', '/auth/login', { username, password }),
};


export const ToolAPI = {
  /** Called on every NFC scan — GET /api/tools/uid/{uid} */
  getByUid: (uid) =>
    request('GET', `/tools/uid/${uid}`),

  /** Browse all tools with optional search/status filter */
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/tools${q ? '?' + q : ''}`);
  },

  getCategories: () =>
    request('GET', '/tools/categories'),

  create: (data) =>
    request('POST', '/tools', data),

  update: (id, data) =>
    request('PATCH', `/tools/${id}`, data),

  delete: (id) =>
    request('DELETE', `/tools/${id}`),
};

// ── Tags ──────────────────────────────────────────────────────────────────────
export const TagAPI = {
  register: (uid, toolId, notes = '') =>
    request('POST', '/tags/register', { uid, toolId, notes }),

  getAll: () =>
    request('GET', '/tags'),

  deactivate: (uid) =>
    request('DELETE', `/tags/${uid}`),
};

// ── Students ──────────────────────────────────────────────────────────────────
export const StudentAPI = {
  /** Called on QR scan — GET /api/students/qr/{qrCode} */
  getByQr: (qrCode) =>
    request('GET', `/students/qr/${encodeURIComponent(qrCode)}`),

  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/students${q ? '?' + q : ''}`);
  },

  create: (data) =>
    request('POST', '/students', data),

  deactivate: (id) =>
    request('DELETE', `/students/${id}`),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const TransactionAPI = {
  /**
   * Submit the cart — POST /api/transactions
   * type: "BORROW" | "PURCHASE"
   * toolIds: array of tool IDs (Long)
   * borrowerName: fallback name if no studentId
   * studentId: Long (optional)
   */
  create: (data) =>
    request('POST', '/transactions', data),

  returnItems: (transactionId, transactionItemIds, conditionNote = '') =>
    request('POST', `/transactions/${transactionId}/return`, {
      transactionItemIds,
      conditionNote,
    }),

  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/transactions${q ? '?' + q : ''}`);
  },

  getOverdue: (hours = 24) =>
    request('GET', `/transactions/overdue?hours=${hours}`),

  getActiveBorrows: (studentId) =>
    request('GET', `/transactions/student/${studentId}/active`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const AdminAPI = {
  getDashboard: () =>
    request('GET', '/admin/dashboard'),

  getPrinterStatus: () =>
    request('GET', '/admin/printer/status'),

  switchPrinterMode: (mode) =>
    request('POST', `/admin/printer/mode?mode=${mode}`),
};