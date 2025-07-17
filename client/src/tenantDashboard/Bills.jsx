import { useState, useEffect } from 'react';
import {generateBill, getMyBills, getAllBills, getBillsByTenant, markBillAsPaid} from '../services/api'

// API functions - replace with your actual API instance
const API = {
  post: async (url, data) => {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  get: async (url) => {
    const response = await fetch(`/api${url}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },
  put: async (url, data) => {
    const response = await fetch(`/api${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// // Bills API functions using your routes
// const generateBill = (billData) => API.post("/bills/generate", billData);
// const getMyBills = () => API.get("/bills/me");
// const getAllBills = () => API.get("/bills");
// const getBillsByTenant = (tenantId) => API.get(`/bills/${tenantId}`);
// const markBillAsPaid = (billId, paymentData) => API.put(`/bills/${billId}/pay`, paymentData);

// Mock tenants - replace with actual API call to get tenants
const mockTenants = [
  { id: '1', name: 'John Doe', email: 'john@example.com', nationalID: '12345678' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', nationalID: '87654321' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', nationalID: '11223344' }
];

export default function PaymentsDashboard() {
  const [userRole] = useState('Landlord'); // Change to 'Tenant' to test tenant view
  const [activeTab, setActiveTab] = useState('overview');
  const [bills, setBills] = useState([]);
  const [tenants, setTenants] = useState(mockTenants); // Replace with actual API call
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [billsLoading, setBillsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [billForm, setBillForm] = useState({
    tenant: '',
    amount: '',
    dueDate: '',
    description: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'M-Pesa'
  });

  // Load bills on component mount
  useEffect(() => {
    loadBills();
  }, [userRole]);

  const loadBills = async () => {
    setBillsLoading(true);
    setError(null);
    
    try {
      let response;
      if (userRole === 'Landlord') {
        response = await getAllBills();
      } else {
        response = await getMyBills();
      }
      
      if (response.success) {
        setBills(response.data || []);
      } else {
        setError(response.message || 'Failed to load bills');
      }
    } catch (error) {
      console.error('Error loading bills:', error);
      setError('Failed to load bills. Please try again.');
    } finally {
      setBillsLoading(false);
    }
  };

  const handleCreateBill = async () => {
    if (!billForm.tenant || !billForm.amount || !billForm.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const billData = {
        tenant: billForm.tenant,
        amount: parseFloat(billForm.amount),
        dueDate: billForm.dueDate,
        description: billForm.description
      };
      
      const response = await generateBill(billData);
      
      if (response.success) {
        setBillForm({ tenant: '', amount: '', dueDate: '', description: '' });
        setShowCreateBill(false);
        await loadBills(); // Refresh bills list
        alert('Bill created successfully!');
      } else {
        setError(response.message || 'Failed to create bill');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      setError('Failed to create bill. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedBill) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const paymentData = {
        paymentMethod: paymentForm.paymentMethod,
        paymentDate: new Date().toISOString()
      };
      
      const response = await markBillAsPaid(selectedBill._id, paymentData);
      
      if (response.success) {
        setShowPaymentModal(false);
        setSelectedBill(null);
        await loadBills(); // Refresh bills list
        alert('Payment processed successfully!');
      } else {
        setError(response.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'Paid' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50';
  };

  const getRoleColor = (role) => {
    return role === 'Tenant' ? 'from-blue-600 to-purple-600' : 'from-green-600 to-teal-600';
  };

  const getRoleIcon = (role) => {
    return role === 'Tenant' ? '👤' : '🏢';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredBills = bills; // All bills are already filtered by backend based on user role

  const stats = {
    totalBills: filteredBills.length,
    pendingBills: filteredBills.filter(b => b.status === 'Pending').length,
    paidBills: filteredBills.filter(b => b.status === 'Paid').length,
    totalAmount: filteredBills.reduce((sum, bill) => sum + bill.amount, 0),
    pendingAmount: filteredBills.filter(b => b.status === 'Pending').reduce((sum, bill) => sum + bill.amount, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${getRoleColor(userRole)} mr-4`}>
              <span className="text-white text-xl">{getRoleIcon(userRole)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments Dashboard</h1>
              <p className="text-gray-600">{userRole} Portal</p>
            </div>
          </div>
          
          {userRole === 'Landlord' && (
            <button
              onClick={() => setShowCreateBill(true)}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <span className="mr-2">💳</span>
              Create Bill
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBills}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingBills}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">⏰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{stats.paidBills}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {userRole === 'Landlord' ? 'Total Revenue' : 'Total Owed'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 text-lg mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {billsLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bills...</p>
          </div>
        ) : (
          <>
            {/* Bills Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {userRole === 'Landlord' ? 'All Bills' : 'My Bills'}
                </h2>
              </div>
              
              {filteredBills.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
                  <p className="text-gray-600">
                    {userRole === 'Landlord' 
                      ? 'Create your first bill to get started.' 
                      : 'You have no bills at the moment.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {userRole === 'Landlord' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tenant
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBills.map((bill) => {
                        const daysUntilDue = getDaysUntilDue(bill.dueDate);
                        return (
                          <tr key={bill._id} className="hover:bg-gray-50">
                            {userRole === 'Landlord' && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {bill.tenant?.name || 'Unknown Tenant'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {bill.tenant?.email || 'No email'}
                                  </div>
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(bill.amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(bill.dueDate)}</div>
                              {bill.status === 'Pending' && (
                                <div className={`text-xs ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                                  {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                                   daysUntilDue === 0 ? 'Due today' : 
                                   `${daysUntilDue} days remaining`}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{bill.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bill.status)}`}>
                                {bill.status}
                              </span>
                              {bill.status === 'Paid' && bill.paymentDate && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Paid on {formatDate(bill.paymentDate)} via {bill.paymentMethod}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {bill.status === 'Pending' && userRole === 'Tenant' && (
                                <button
                                  onClick={() => {
                                    setSelectedBill(bill);
                                    setShowPaymentModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                >
                                  Pay Now
                                </button>
                              )}
                              {bill.status === 'Pending' && userRole === 'Landlord' && (
                                <button
                                  onClick={() => {
                                    setSelectedBill(bill);
                                    setShowPaymentModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 transition-colors duration-200"
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Create Bill Modal */}
        {showCreateBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Bill</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
                  <select
                    value={billForm.tenant}
                    onChange={(e) => setBillForm(prev => ({ ...prev, tenant: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant._id || tenant.id} value={tenant._id || tenant.id}>
                        {tenant.name} ({tenant.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
                  <input
                    type="number"
                    value={billForm.amount}
                    onChange={(e) => setBillForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={billForm.dueDate}
                    onChange={(e) => setBillForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={billForm.description}
                    onChange={(e) => setBillForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                    placeholder="Bill description"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowCreateBill(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBill}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Bill'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {userRole === 'Landlord' ? 'Mark as Paid' : 'Make Payment'}
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(selectedBill.amount)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="font-semibold text-gray-900">{formatDate(selectedBill.dueDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="font-semibold text-gray-900">{selectedBill.description}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedBill(null);
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : userRole === 'Landlord' ? 'Mark as Paid' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}