const BASE = '/api';

export const getToken   = ()    => sessionStorage.getItem('auth_token');
export const setToken   = (tok) => sessionStorage.setItem('auth_token', tok);
export const clearToken = ()    => sessionStorage.removeItem('auth_token');

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
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}

export const AuthAPI = {
  login: (username, password) =>
    request('POST', '/auth/login', { username, password }),
};

export const ToolAPI = {
  getByUid:      (uid)         => request('GET',    `/tools/uid/${uid}`),
  getAll:        (params = {}) => { const q = new URLSearchParams(params).toString(); return request('GET', `/tools${q ? '?' + q : ''}`); },
  getCategories: ()            => request('GET',    '/tools/categories'),
  create:        (data)        => request('POST',   '/tools', data),
  update:        (id, data)    => request('PATCH',  `/tools/${id}`, data),
  delete:        (id)          => request('DELETE', `/tools/${id}`),
};

export const TagAPI = {
  register:   (uid, toolId, notes = '') => request('POST',   '/tags/register', { uid, toolId, notes }),
  getAll:     ()                        => request('GET',    '/tags'),
  deactivate: (uid)                     => request('DELETE', `/tags/${uid}`),
};

export const StudentAPI = {
  getByQr:    (qrCode)      => request('GET',    `/students/qr/${encodeURIComponent(qrCode)}`),
  getAll:     (params = {}) => { const q = new URLSearchParams(params).toString(); return request('GET', `/students${q ? '?' + q : ''}`); },
  create:     (data)        => request('POST',   '/students', data),
  deactivate: (id)          => request('DELETE', `/students/${id}`),
};

export const TransactionAPI = {
  create:           (data)                                                    => request('POST', '/transactions', data),
  reprint:          (id)                                                      => request('POST', `/transactions/${id}/reprint`),
  returnItems:      (transactionId, transactionItemIds, conditionNote = '')   => request('POST', `/transactions/${transactionId}/return`, { transactionItemIds, conditionNote }),
  getAll:           (params = {}) => { const q = new URLSearchParams(params).toString(); return request('GET', `/transactions${q ? '?' + q : ''}`); },
  getOverdue:       (hours = 24)  => request('GET',  `/transactions/overdue?hours=${hours}`),
  getActiveBorrows: (studentId)   => request('GET',  `/transactions/student/${studentId}/active`),
};

export const AdminAPI = {
  getDashboard:      ()     => request('GET',  '/admin/dashboard'),
  getPrinterStatus:  ()     => request('GET',  '/admin/printer/status'),
  switchPrinterMode: (mode) => request('POST', `/admin/printer/mode?mode=${mode}`),
};