// Quick apartment diagnostic component
import React, { useState } from 'react';

const ApartmentDiagnostic = () => {
  const [apartments, setApartments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://safe-stay-backend.onrender.com/api/apartments/available');
      const data = await response.json();
      setApartments(data);
      console.log('🏠 Apartment test result:', data);
    } catch (err) {
      setError(err.message);
      console.error('❌ Apartment test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded mb-4">
      <h3 className="text-lg font-bold mb-2">🔧 Apartment Diagnostic</h3>
      <button 
        onClick={testApartments}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Apartment API'}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}
      
      {apartments && (
        <div className="mt-2 p-2 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700">
            ✅ Found {apartments.data?.length || 0} apartments
          </p>
          {apartments.data?.length > 0 && (
            <ul className="mt-2 text-sm">
              {apartments.data.map(apt => (
                <li key={apt._id} className="border-b py-1">
                  🏠 {apt.name} - ${apt.rentAmount}/month (by {apt.landlordName})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ApartmentDiagnostic;
