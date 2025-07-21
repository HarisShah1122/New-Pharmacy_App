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
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!id || !uuidRegex.test(id)) {
      setError('Invalid or missing Payer ID. Redirecting to Payers list...');
      setLoading(false);
      setTimeout(() => navigate('/healthauthorities/payers'), 2000);
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
      const response = await fetch(endpoint);
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Unexpected response format: ${text.slice(0, 50)}...`);
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch HA credential.');
      }

      if (result.success && result.data) {
        setCredential({
          ...result.data,
          status: (result.data.status || 'unknown').toUpperCase(),
        });
        if (result.data.user_name === 'default_user') {
          setError('No credential found. Returning default for testing.');
        }
      } else {
        setError(result.message || 'No HA credential found for this payer.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the credential.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/health/payers');
  };

  const handleRegister = () => {
    navigate('/health-authority/register', { state: { payer_id: id } });
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
          {loading && <CSpinner color="primary" />}
          {!loading && error && (
            <>
              <CAlert color="danger">{error}</CAlert>
              {!credential && (
                <CButton color="primary" onClick={handleRegister}>
                  Register HA Credential
                </CButton>
              )}
            </>
          )}
          {!loading && credential && (
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
                  <CTableDataCell>{credential.user_name || '-'}</CTableDataCell>
                  <CTableDataCell>{credential.code || '-'}</CTableDataCell>
                  <CTableDataCell>{credential.password || '-'}</CTableDataCell>
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
                  <CTableDataCell>{formatDate(credential.createdAt)}</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          )}
          {!loading && !error && !credential && (
            <CAlert color="warning">Health Authority credential not found.</CAlert>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default PayerHACredential;