
import React, { useEffect, useState, useCallback } from 'react';
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import 'bootstrap/dist/css/bootstrap.min.css';

const DiagnosesTable = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchICD, setSearchICD] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  const [formData, setFormData] = useState({
    icd_code: '',
    diagnosis_code: '',
    description: '',
    is_primary: '',
  });

  const fetchDiagnoses = useCallback((icdCode = '') => {
    const params = new URLSearchParams(location.search);
    const listId = params.get('listId');
    let url = listId
      ? `${baseUrl}/diagnoses?diagnosis_list_id=${listId}`
      : `${baseUrl}/diagnoses`;
    
    if (icdCode) {
      url += `${listId ? '&' : '?'}icd_code=${encodeURIComponent(icdCode)}`;
    }

    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch diagnoses');
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setDiagnoses(data.data);
        } else {
          setDiagnoses([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        setLoading(false);
      });
  }, [location.search]);

  const debouncedFetchDiagnoses = useCallback(debounce((icdCode) => {
    fetchDiagnoses(icdCode);
  }, 300), [fetchDiagnoses]);

  useEffect(() => {
    fetchDiagnoses();
  }, [fetchDiagnoses]);

  const handleSearch = () => {
    debouncedFetchDiagnoses(searchICD);
  };

  const handleSearchInputChange = (e) => {
    setSearchICD(e.target.value);
    if (e.target.value === '') {
      debouncedFetchDiagnoses('');
    } else {
      debouncedFetchDiagnoses(e.target.value);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    setModalError(null);
    setSuccess(null);

    const params = new URLSearchParams(location.search);
    const listId = params.get('listId');

    if (!listId) {
      setModalError('No diagnosis list selected. Please select a diagnosis list first.');
      setFormLoading(false);
      return;
    }

    if (!formData.icd_code || !formData.diagnosis_code || !formData.description || formData.is_primary === '') {
      setModalError('All fields are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      diagnoses: [
        {
          icd_code: formData.icd_code,
          diagnosis_code: formData.diagnosis_code,
          description: formData.description,
          is_primary: formData.is_primary === 'Yes',
          diagnosis_list_id: listId,
        },
      ],
    };

    fetch(`${baseUrl}/diagnoses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to add diagnosis: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccess(data.message || 'Diagnosis added successfully');
        setFormLoading(false);
        // Refresh the diagnoses list
        const params = new URLSearchParams(location.search);
        const listId = params.get('listId');
        const url = listId
          ? `${baseUrl}/diagnoses?diagnosis_list_id=${listId}`
          : `${baseUrl}/diagnoses`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (data.data) {
              setDiagnoses(data.data);
            } else {
              setDiagnoses([]);
            }
          });
        setTimeout(() => {
          setModalVisible(false);
          setSuccess(null);
        }, 2000);
      })
      .catch((error) => {
        console.error(error);
        setModalError(error.message || 'Failed to add diagnosis');
        setFormLoading(false);
      });
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Diagnoses</strong>
          <div className="d-flex align-items-center">
            <CFormInput
              type="text"
              placeholder="Search diagnoses"
              value={searchICD}
              onChange={handleSearchInputChange}
              className="me-2"
              style={{ width: '200px' }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <CButton
              color="primary"
              onClick={() => {
                setModalVisible(true);
                setFormData({
                  icd_code: '',
                  diagnosis_code: '',
                  description: '',
                  is_primary: '',
                });
                setModalError(null);
                setSuccess(null);
              }}
            >
              + Add Diagnosis
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
                  <CTableHeaderCell scope="col">ICD Code</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Diagnosis Code</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Primary</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {diagnoses.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="5" className="text-center">
                      No diagnoses found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  diagnoses.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.icd_code}</CTableDataCell>
                      <CTableDataCell>{item.diagnosis_code}</CTableDataCell>
                      <CTableDataCell>{item.description}</CTableDataCell>
                      <CTableDataCell>{item.is_primary ? 'Yes' : 'No'}</CTableDataCell>
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
                            <CDropdownItem href={`/diagnoses/${item.id}/edit`}>
                              Update Diagnosis
                            </CDropdownItem>
                            <CDropdownItem
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this diagnosis?')) {
                                  fetch(`${baseUrl}/diagnosis/${item.id}`, {
                                    method: 'DELETE',
                                  })
                                    .then((res) => {
                                      if (!res.ok) throw new Error('Failed to delete diagnosis');
                                      setDiagnoses(diagnoses.filter((diag) => diag.id !== item.id));
                                    })
                                    .catch((error) => {
                                      console.error(error);
                                      setError('Failed to delete diagnosis');
                                    });
                                }
                              }}
                            >
                              Delete Diagnosis
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

      {modalVisible && (
        <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Diagnosis</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {modalError && <CAlert color="danger">{modalError}</CAlert>}
                {success && <CAlert color="success">{success}</CAlert>}
                {formLoading && <CSpinner color="primary" />}
                <CForm onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ICD Code</label>
                    <CFormInput
                      type="text"
                      name="icd_code"
                      value={formData.icd_code}
                      onChange={handleChange}
                      required
                      placeholder="Enter ICD code"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Diagnosis Code</label>
                    <CFormInput
                      type="text"
                      name="diagnosis_code"
                      value={formData.diagnosis_code}
                      onChange={handleChange}
                      required
                      placeholder="Enter diagnosis code"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <CFormInput
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="Enter description"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Primary</label>
                    <CFormSelect
                      name="is_primary"
                      value={formData.is_primary}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Primary</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </CFormSelect>
                  </div>
                </CForm>
              </div>
              <div className="modal-footer">
                <CButton
                  color="secondary"
                  onClick={() => setModalVisible(false)}
                  disabled={formLoading}
                >
                  Cancel
                </CButton>
                <CButton
                  color="primary"
                  onClick={handleSubmit}
                  disabled={formLoading}
                >
                  Save
                </CButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </CCol>
  );
};

export default DiagnosesTable;
