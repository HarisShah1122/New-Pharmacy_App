import React, { useState, useEffect } from 'react';
import {
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CAlert,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
} from '@coreui/react';
import { useLocation, useNavigate } from 'react-router-dom';

const ConfigurationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialConfigData = location.state || {};
  const [configData, setConfigData] = useState(initialConfigData);
  const [loading, setLoading] = useState(!initialConfigData.healthAuthorityName);
  const [error, setError] = useState(null);
  const [diagnosisLists, setDiagnosisLists] = useState([]);
  const [drugLists, setDrugLists] = useState([]);
  const [clinicianLists, setClinicianLists] = useState([]);
  const [formData, setFormData] = useState({
    healthAuthorityName: initialConfigData.healthAuthorityName || '',
    diagnosisListId: initialConfigData.diagnosisListId || '',
    drugListId: initialConfigData.drugListId || '',
    clinicianListId: initialConfigData.clinicianListId || '',
  });
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    console.log('ConfigurationPage loaded');
    console.log('Base URL:', baseUrl);
    console.log('Location state:', location.state);

    const fetchLists = async () => {
      try {
        const [diagnosisRes, drugRes, clinicianRes] = await Promise.all([
          fetch(`${baseUrl}/diagnosis-list`),
          fetch(`${baseUrl}/drug-lists`),
          fetch(`${baseUrl}/api/clinician-lists`),
        ]);

        if (!diagnosisRes.ok) throw new Error(`Failed to fetch diagnosis lists: ${diagnosisRes.statusText}`);
        const diagnosisData = await diagnosisRes.json();
        setDiagnosisLists(diagnosisData.data || []);

        if (!drugRes.ok) throw new Error(`Failed to fetch drug lists: ${drugRes.statusText}`);
        const drugData = await drugRes.json();
        setDrugLists(drugData.data || []);

        if (!clinicianRes.ok) throw new Error(`Failed to fetch clinician lists: ${clinicianRes.statusText}`);
        const clinicianData = await clinicianRes.json();
        setClinicianLists(clinicianData.data || []);
      } catch (err) {
        console.error('Error fetching lists:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchLatestConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/api/health-authorities`);
        if (!res.ok) throw new Error(`Failed to fetch health authorities: ${res.statusText}`);
        const data = await res.json();
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
          throw new Error('No health authorities found');
        }

        const latestAuthority = data.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        )[0];

        const config = {
          healthAuthorityName: latestAuthority.name,
          diagnosisList:
            diagnosisLists.find((list) => list.id === latestAuthority.diagnosis_list_id)?.name || 'None',
          drugList:
            drugLists.find((list) => list.drug_list_id === latestAuthority.drug_list_id)?.name || 'None',
          clinicianList:
            clinicianLists.find((list) => list.id === latestAuthority.clinician_list_id)?.name || 'None',
        };

        setConfigData(config);
        setFormData({
          healthAuthorityName: latestAuthority.name,
          diagnosisListId: latestAuthority.diagnosis_list_id || '',
          drugListId: latestAuthority.drug_list_id || '',
          clinicianListId: latestAuthority.clinician_list_id || '',
        });
      } catch (err) {
        console.error('Error fetching latest config:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLists().then(() => {
      if (!initialConfigData.healthAuthorityName) {
        fetchLatestConfig();
      }
    });
  }, [initialConfigData.healthAuthorityName, baseUrl, diagnosisLists, drugLists, clinicianLists]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.healthAuthorityName,
      diagnosis_list_id: formData.diagnosisListId,
      drug_list_id: formData.drugListId,
      clinician_list_id: formData.clinicianListId,
    };

    try {
      const res = await fetch(`${baseUrl}/health-authority-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to save configuration: ${res.statusText}`);
      const result = await res.json();
      console.log('Configuration saved:', result);

      setConfigData({
        healthAuthorityName: formData.healthAuthorityName,
        diagnosisList:
          diagnosisLists.find((list) => list.id === formData.diagnosisListId)?.name || 'None',
        drugList: drugLists.find((list) => list.drug_list_id === formData.drugListId)?.name || 'None',
        clinicianList:
          clinicianLists.find((list) => list.id === formData.clinicianListId)?.name || 'None',
      });
    } catch (err) {
      console.error('Error saving configuration:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Configuration Details</strong>
            <CButton color="primary" onClick={() => navigate('/health/authorities')}>
              Back to Health Authorities
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <CSpinner color="primary" />
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <>
              <CForm onSubmit={handleSubmit} className="mb-4">
                {/* <div className="mb-3">
                  <CFormLabel>Health Authority Name</CFormLabel>
                  <CFormInput
                    type="text"
                    name="healthAuthorityName"
                    value={formData.healthAuthorityName}
                    onChange={handleInputChange}
                    placeholder="Enter health authority name"
                    required
                  />
                </div> */}
                <div className="mb-3">
                  <CFormLabel>Diagnosis List</CFormLabel>
                  <CFormSelect
                    name="diagnosisListId"
                    value={formData.diagnosisListId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Diagnosis List</option>
                    {diagnosisLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
                <div className="mb-3">
                  <CFormLabel>Drug List</CFormLabel>
                  <CFormSelect
                    name="drugListId"
                    value={formData.drugListId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Drug List</option>
                    {drugLists.map((list) => (
                      <option key={list.drug_list_id} value={list.drug_list_id}>
                        {list.name}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
                <div className="mb-3">
                  <CFormLabel>Clinician List</CFormLabel>
                  <CFormSelect
                    name="clinicianListId"
                    value={formData.clinicianListId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Clinician List</option>
                    {clinicianLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
                <CButton type="submit" color="primary" disabled={loading}>
                  {loading ? <CSpinner size="sm" /> : 'Save Configuration'}
                </CButton>
              </CForm>

              {Object.keys(configData).length === 0 ? (
                <p>No configuration data available. Please configure a health authority first.</p>
              ) : (
                <CTable hover striped bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Health Authority</CTableHeaderCell>
                      <CTableHeaderCell>Diagnosis List</CTableHeaderCell>
                      <CTableHeaderCell>Drug List</CTableHeaderCell>
                      <CTableHeaderCell>Clinician List</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow>
                      <CTableDataCell>{configData.healthAuthorityName || '-'}</CTableDataCell>
                      <CTableDataCell>{configData.diagnosisList || '-'}</CTableDataCell>
                      <CTableDataCell>{configData.drugList || '-'}</CTableDataCell>
                      <CTableDataCell>{configData.clinicianList || '-'}</CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default ConfigurationPage;