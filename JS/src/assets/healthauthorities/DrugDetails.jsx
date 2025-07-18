
import React, { useEffect, useState } from 'react';
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
  CSpinner,
  CAlert,
  CButton,
} from '@coreui/react';
import { useParams, useNavigate } from 'react-router-dom';
const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const DrugDetails = () => {
  const [drug, setDrug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    const fetchDrug = async () => {
      if (!id || id === ':id' || !isValidUUID(id)) {
        console.error('Invalid drug ID:', id);
        setError('Invalid drug ID. Please provide a valid UUID.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const url = `${baseUrl}/drugs/${id}`;
        console.log('Fetching URL:', url);
        console.log('ID from useParams:', id);
        const response = await fetch(url);
        console.log(`Response status: ${response.status}`);
        const text = await response.text();
        console.log('Raw response:', text);
        if (!response.ok) {
          throw new Error(`Failed to fetch drug: ${response.statusText} (${text})`);
        }
        const data = JSON.parse(text);
        console.log('Parsed drug data:', data);
        if (data.data) {
          setDrug(data.data);
        } else {
          setError('Drug not found');
        }
      } catch (error) {
        console.error('Error fetching drug:', error);
        setError(error.message || 'Failed to fetch drug');
      } finally {
        setLoading(false);
      }
    };

    fetchDrug();
  }, [id, baseUrl]);
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Drug Details</strong>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <CSpinner color="primary" />
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : drug ? (
            <div>
              <CTable hover striped bordered>
                <CTableBody>
                  <CTableRow>
                    <CTableHeaderCell>NDC Code</CTableHeaderCell>
                    <CTableDataCell>{drug.ndc_drug_code || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>HA Code</CTableHeaderCell>
                    <CTableDataCell>{drug.ha_code || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Trade Name</CTableHeaderCell>
                    <CTableDataCell>{drug.trade_name || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableDataCell>{drug.status || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Manufacturer</CTableHeaderCell>
                    <CTableDataCell>{drug.manufacturer || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Local Agent</CTableHeaderCell>
                    <CTableDataCell>{drug.local_agent || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Dosage Form</CTableHeaderCell>
                    <CTableDataCell>{drug.dosage_form || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Package Type</CTableHeaderCell>
                    <CTableDataCell>{drug.package_type || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Package Size</CTableHeaderCell>
                    <CTableDataCell>{drug.package_size || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Granular Unit</CTableHeaderCell>
                    <CTableDataCell>{drug.granular_unit || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Unit Type</CTableHeaderCell>
                    <CTableDataCell>{drug.unit_type || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Active Ingredients</CTableHeaderCell>
                    <CTableDataCell>{drug.active_ingredients || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Strengths</CTableHeaderCell>
                    <CTableDataCell>{drug.strengths || 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>Start Date</CTableHeaderCell>
                    <CTableDataCell>{drug.start_date ? new Date(drug.start_date).toLocaleString() : 'N/A'}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell>End Date</CTableHeaderCell>
                    <CTableDataCell>{drug.end_date ? new Date(drug.end_date).toLocaleString() : 'N/A'}</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
              <div className="mt-3">
                <CButton color="secondary" onClick={handleBack}>
                  Back
                </CButton>
              </div>
            </div>
          ) : (
            <CAlert color="warning">No drug data available</CAlert>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default DrugDetails;
