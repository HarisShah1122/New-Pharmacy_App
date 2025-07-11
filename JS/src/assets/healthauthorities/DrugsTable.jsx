
import React, { useEffect, useState, useCallback } from 'react';
import {
  CCol,
  CRow,
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAlert,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
} from '@coreui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';

const DrugsTable = () => {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchNDC, setSearchNDC] = useState('');
  const [formData, setFormData] = useState({
    ndc_drug_code: '',
    dispensed_quantity: '',
    days_of_supply: '',
    instructions: '',
    ha_code: '',
    trade_name: '',
    manufacturer: '',
    local_agent: '',
    dosage_form: '',
    package_type: '',
    package_size: '',
    granular_unit: '',
    unit_type: '',
    active_ingredients: '',
    strengths: '',
    start_date: '',
    end_date: '',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  const fetchDrugs = useCallback((ndcCode = '') => {
    const params = new URLSearchParams(location.search);
    const listId = params.get('listId');
    let url = listId
      ? `${baseUrl}/drugs?drug_list_id=${listId}`
      : `${baseUrl}/drugs`;
    
    if (ndcCode) {
      url += `${listId ? '&' : '?'}ndc_drug_code=${encodeURIComponent(ndcCode)}`;
    }

    setLoading(true);
    setError(null);
    console.log('Fetching drugs from:', url);

    fetch(url)
      .then((res) => {
        console.log('GET /drugs response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            console.error('Error response:', errorData);
            throw new Error(errorData.details || errorData.error || `Failed to fetch drugs: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('GET /drugs data:', data);
        if (data.data) {
          setDrugs(data.data);
        } else {
          setDrugs([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching drugs:', error);
        setError(error.message || 'Failed to load drugs');
        setLoading(false);
      });
  }, [location.search]);

  const debouncedFetchDrugs = useCallback(debounce((ndcCode) => {
    fetchDrugs(ndcCode);
  }, 300), [fetchDrugs]);

  useEffect(() => {
    fetchDrugs();
  }, [fetchDrugs]);

  const handleSearch = () => {
    debouncedFetchDrugs(searchNDC);
  };

  const handleSearchInputChange = (e) => {
    setSearchNDC(e.target.value);
    if (e.target.value === '') {
      debouncedFetchDrugs('');
    } else {
      debouncedFetchDrugs(e.target.value);
    }
  };

  const handleViewDrug = (id) => {
    console.log('Navigating to drug details with ID:', id);
    navigate(`/drugs/${id}`);
  };

  const handleDeleteDrug = (id) => {
    if (!window.confirm('Are you sure you want to deactivate this drug?')) return;

    console.log('Deactivating drug with ID:', id);
    fetch(`${baseUrl}/drugs/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        console.log('DELETE /drugs response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to deactivate drug: ${res.statusText}`);
          });
        }
        setDrugs(drugs.filter((drug) => drug.id !== id));
        return res.json();
      })
      .catch((error) => {
        console.error('Error deactivating drug:', error);
        setError(error.message || 'Failed to deactivate drug');
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddDrug = () => {
    const params = new URLSearchParams(location.search);
    const listId = params.get('listId') || uuidv4();

    const drugData = {
      id: uuidv4(),
      ndc_drug_code: formData.ndc_drug_code || undefined,
      dispensed_quantity: formData.dispensed_quantity ? parseInt(formData.dispensed_quantity, 10) : undefined,
      days_of_supply: formData.days_of_supply ? parseInt(formData.days_of_supply, 10) : undefined,
      instructions: formData.instructions || undefined,
      ha_code: formData.ha_code || undefined,
      trade_name: formData.trade_name || undefined,
      status: 'active',
      manufacturer: formData.manufacturer || undefined,
      local_agent: formData.local_agent || undefined,
      dosage_form: formData.dosage_form || undefined,
      package_type: formData.package_type || undefined,
      package_size: formData.package_size || undefined,
      granular_unit: formData.granular_unit ? parseInt(formData.granular_unit, 10) : undefined,
      unit_type: formData.unit_type || undefined,
      active_ingredients: formData.active_ingredients || undefined,
      strengths: formData.strengths || undefined,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
      drug_list_id: listId,
    };

    console.log('Adding drug:', { drugs: [drugData] });

    fetch(`${baseUrl}/drugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drugs: [drugData] }),
    })
      .then((res) => {
        console.log('POST /drugs response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to add drug: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((response) => {
        const newDrug = response.data[0];
        setDrugs([...drugs, newDrug]);
        setModalVisible(false);
        setFormData({
          ndc_drug_code: '',
          dispensed_quantity: '',
          days_of_supply: '',
          instructions: '',
          ha_code: '',
          trade_name: '',
          manufacturer: '',
          local_agent: '',
          dosage_form: '',
          package_type: '',
          package_size: '',
          granular_unit: '',
          unit_type: '',
          active_ingredients: '',
          strengths: '',
          start_date: '',
          end_date: '',
        });
      })
      .catch((error) => {
        console.error('Error adding drug:', error);
        setError(error.message || 'Failed to add drug');
      });
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Drugs</strong>
          <div className="d-flex align-items-center">
            <CFormInput
              type="text"
              placeholder="Search drugs"
              value={searchNDC}
              onChange={handleSearchInputChange}
              className="me-2"
              style={{ width: '200px' }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <CButton color="primary" onClick={() => setModalVisible(true)}>
              <span className="me-2">+</span>Add Drugs
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <CSpinner color="primary" />
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover striped bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">NDC Drug Code</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Dispensed Quantity</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Days of Supply</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Instructions</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {drugs.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="5" className="text-center">
                      No drugs found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  drugs.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.ndc_drug_code || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.dispensed_quantity || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.days_of_supply || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.instructions || 'N/A'}</CTableDataCell>
                      <CTableDataCell>
                        <CDropdown alignment="end">
                          <CDropdownToggle
                            color="light"
                            caret={false}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#f1f1f1',
                              border: 'none',
                              borderRadius: '6px',
                            }}
                          >
                            <span style={{ fontSize: '24px', cursor: 'pointer' }}>⋯</span>
                          </CDropdownToggle>
                          <CDropdownMenu>
                            <CDropdownItem onClick={() => handleDeleteDrug(item.id)}>
                              Deactivate
                            </CDropdownItem>
                            <CDropdownItem onClick={() => handleViewDrug(item.id)}>
                              View Drug Details
                            </CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Add Drug</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={4}>
              <div className="mb-3">
                <CFormLabel>NDC Drug Code</CFormLabel>
                <CFormInput
                  type="text"
                  name="ndc_drug_code"
                  value={formData.ndc_drug_code}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>HA Code</CFormLabel>
                <CFormInput
                  type="text"
                  name="ha_code"
                  value={formData.ha_code}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Trade Name</CFormLabel>
                <CFormInput
                  type="text"
                  name="trade_name"
                  value={formData.trade_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Manufacturer</CFormLabel>
                <CFormInput
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Local Agent</CFormLabel>
                <CFormInput
                  type="text"
                  name="local_agent"
                  value={formData.local_agent}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Dosage Form</CFormLabel>
                <CFormInput
                  type="text"
                  name="dosage_form"
                  value={formData.dosage_form}
                  onChange={handleInputChange}
                />
              </div>
            </CCol>
            <CCol md={4}>
              <div className="mb-3">
                <CFormLabel>Granular Unit</CFormLabel>
                <CFormInput
                  type="number"
                  name="granular_unit"
                  value={formData.granular_unit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Unit Type</CFormLabel>
                <CFormInput
                  type="text"
                  name="unit_type"
                  value={formData.unit_type}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Active Ingredients</CFormLabel>
                <CFormInput
                  type="text"
                  name="active_ingredients"
                  value={formData.active_ingredients}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Strengths</CFormLabel>
                <CFormInput
                  type="text"
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Start Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>End Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </div>
            </CCol>
            <CCol md={4}>
              <div className="mb-3">
                <CFormLabel>Package Type</CFormLabel>
                <CFormInput
                  type="text"
                  name="package_type"
                  value={formData.package_type}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Package Size</CFormLabel>
                <CFormInput
                  type="text"
                  name="package_size"
                  value={formData.package_size}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Dispensed Quantity</CFormLabel>
                <CFormInput
                  type="number"
                  name="dispensed_quantity"
                  value={formData.dispensed_quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Days of Supply</CFormLabel>
                <CFormInput
                  type="number"
                  name="days_of_supply"
                  value={formData.days_of_supply}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Instructions</CFormLabel>
                <CFormInput
                  type="text"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                />
              </div>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddDrug}>
            Add Drug
          </CButton>
        </CModalFooter>
      </CModal>
    </CCol>
  );
};

export default DrugsTable;
