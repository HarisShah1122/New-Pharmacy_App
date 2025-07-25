import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
  CAlert,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';

const PayerHACredential = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [credential, setCredential] = useState(state?.credential || null);
  const [loading, setLoading] = useState(!state?.credential);
  const [error, setError] = useState('');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    console.log('Payer ID from URL:', id);
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!id) {
      setError('Missing Payer ID. Redirecting to Payers list...');
      setLoading(false);
      setTimeout(() => navigate('/health/payers'), 2000);
      return;
    }
    if (!uuidRegex.test(id)) {
      setError(`Invalid Payer ID format: "${id}". Must be a valid UUID. Redirecting to Payers list...`);
      setLoading(false);
      setTimeout(() => navigate('/health/payers'), 2000);
      return;
    }
    if (!state?.credential) {
      fetchCredential();
    }
  }, [id, navigate, state]);

  const fetchCredential = async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = `${baseUrl}/payer/${id}/ha-credential`;
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type');
        let errorMessage = `Failed to fetch HA credential: ${response.status} ${response.statusText}`;
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          errorMessage = result.error || result.message || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = `Unexpected response: ${text.slice(0, 50)}...`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('API Response:', result);
      if (result.success && result.data) {
        setCredential({
          user_name: result.data.user_name || '-',
          code: result.data.code || '-',
          password: result.data.password || '-',
          status: (result.data.status || 'unknown').toUpperCase(),
          created_at: result.data.created_at || '',
        });
        if (result.data.user_name === 'default_user') {
          setError('No active credential found. Default user returned.');
        }
      } else {
        setError(result.message || 'No HA credential found for this payer.');
        setCredential(null);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the credential.');
      setCredential(null);
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/health/payers');

  const handleRegister = () => {
    navigate('/health/payers', { state: { openRegisterModal: true, payer_id: id } });
  };

  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
      : '-';
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Health Authority Credential Details</strong>
            <CButton color="secondary" onClick={handleBack}>
              Back to Payers List
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {loading && (
            <div className="text-center">
              <CSpinner color="primary" />
              <p>Loading credential...</p>
            </div>
          )}
          {!loading && error && (
            <div>
              <CAlert color="danger">{error}</CAlert>
              {id && (
                <CButton color="primary" onClick={handleRegister}>
                  Register HA Credential
                </CButton>
              )}
            </div>
          )}
          {!loading && !error && credential && (
            <CTable hover bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>User Name</CTableHeaderCell>
                  <CTableHeaderCell>Code</CTableHeaderCell>
                  <CTableHeaderCell>Password</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow>
                  <CTableDataCell>{credential.user_name}</CTableDataCell>
                  <CTableDataCell>{credential.code}</CTableDataCell>
                  <CTableDataCell>{credential.password}</CTableDataCell>
                  <CTableDataCell>
                    <span
                      className={`badge ${
                        credential.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'
                      }`}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      {credential.status}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>{formatDate(credential.created_at)}</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          )}
          {!loading && !error && !credential && (
            <div>
              <CAlert color="warning">
                Health Authority credential not found for this payer.
              </CAlert>
              {id && (
                <CButton color="primary" onClick={handleRegister}>
                  Register HA Credential
                </CButton>
              )}
            </div>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default PayerHACredential;