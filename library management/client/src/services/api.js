const API_BASE = '/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('library_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const api = {
  login: async (identifier, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, id: identifier, memberId: identifier, password })
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Books
  getBooks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/books?${query}`);
    return handleResponse(res);
  },

  getBookById: async (id) => {
    const res = await fetch(`${API_BASE}/books/${id}`);
    return handleResponse(res);
  },

  createBook: async (bookData) => {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookData)
    });
    return handleResponse(res);
  },

  updateBook: async (id, bookData) => {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(bookData)
    });
    return handleResponse(res);
  },

  deleteBook: async (id) => {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Circulation
  borrowBook: async (bookId, userId) => {
    const res = await fetch(`${API_BASE}/circulation/borrow`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId, userId })
    });
    return handleResponse(res);
  },

  returnBook: async (borrowRecordId, returnCondition = 'GOOD') => {
    const res = await fetch(`${API_BASE}/circulation/return`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ borrowRecordId, returnCondition })
    });
    return handleResponse(res);
  },

  reserveBook: async (bookId) => {
    const res = await fetch(`${API_BASE}/circulation/reserve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId })
    });
    return handleResponse(res);
  },

  cancelReservation: async (id) => {
    const res = await fetch(`${API_BASE}/circulation/cancel-reservation/${id}`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  renewLoan: async (borrowId) => {
    const res = await fetch(`${API_BASE}/circulation/renew/${borrowId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getMyLoans: async () => {
    const res = await fetch(`${API_BASE}/circulation/my-loans`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getAllCirculationRecords: async () => {
    const res = await fetch(`${API_BASE}/circulation/all-records`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  payFine: async (borrowId) => {
    const res = await fetch(`${API_BASE}/circulation/pay-fine/${borrowId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Reports
  getSummaryReport: async () => {
    const res = await fetch(`${API_BASE}/reports/summary`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getOverdueDefaulters: async () => {
    const res = await fetch(`${API_BASE}/reports/overdue`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
