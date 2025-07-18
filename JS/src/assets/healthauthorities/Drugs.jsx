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
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
  CAlert,
  CForm,
  CFormInput,
  CFormSelect,
  CModal, 
  CModalHeader, 
  CModalTitle, 
  CModalBody, 
  CModalFooter, 
} from '@coreui/react';
import { cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const DrugList = () => {
  const [drugLists, setDrugLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false); 
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false); 
  const [selectedDrugList, setSelectedDrugList] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    fetchDrugLists();
  }, []);

  const fetchDrugLists = () => {
    setLoading(true);
    setError(null);
    console.log('Fetching drug lists');
    fetch(`${baseUrl}/drug-lists`)
      .then((res) => {
        console.log('GET /drug-lists response status:', res.status);
        if (!res.ok) throw new Error(`Failed to fetch drug lists: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log('GET /drug-lists data:', data);
        if (data.data) {
          const formattedData = data.data.map((list) => ({
            ...list,
            status: (list.status || '').toLowerCase(),
          }));
          setDrugLists(formattedData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching drug lists:', error);
        setError(error.message || 'Failed to load drug lists');
        setLoading(false);
      });
  };

  const openModal = () => {
    console.log('Opening modal');
    setModalOpen(true);
    setError(null);
    setSuccess(null);
    setFormData({
      name: '',
      code: '',
      status: '',
    });
  };

  const closeModal = () => {
    console.log('Closing modal');
    setModalOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.code || !formData.status) {
      console.log('Validation failed: Name, Code, and Status are required');
      setError('Name, Code, and Status are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      drugs: [
        {
          name: formData.name,
          code: formData.code,
          status: formData.status,
        },
      ],
    };
    console.log('POST /drug-lists payload:', payload);

    fetch(`${baseUrl}/drug-lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        console.log('POST /drug-lists response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to add drug list: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('POST /drug-lists response:', data);
        setSuccess(data.message || 'Drug list added successfully');
        setFormLoading(false);
        fetchDrugLists();
        setTimeout(closeModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        console.error('Error adding drug list:', error);
        setError(error.message || 'Failed to add drug list');
        setFormLoading(false);
      });
  };

  const handleDelete = (drug_list_id) => {
    if (!window.confirm('Are you sure you want to delete this drug list?')) return;

    console.log('Deleting drug list with id:', drug_list_id);
    fetch(`${baseUrl}/drug-lists/${drug_list_id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        console.log('DELETE /drug-lists response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to delete drug list: ${res.statusText}`);
          });
        }
        setDrugLists(drugLists.filter((list) => list.drug_list_id !== drug_list_id));
        setSuccess('Drug list deleted successfully');
        setTimeout(() => setSuccess(null), 5000);
        return res.json();
      })
      .catch((error) => {
        console.error('Error deleting drug list:', error);
        setError(error.message || 'Failed to delete drug list');
        fetchDrugLists();
      });
  };

  const handleViewDrugs = (drug_list_id) => {
    console.log('Navigating to drug details with drug_list_id:', drug_list_id);
    navigate(`/drugs?listId=${drug_list_id}`);
  };

  const handleActivate = (drugList) => {
    setSelectedDrugList(drugList);
    setIsActivateDialogOpen(true);
  };

  const handleDeactivate = (drugList) => {
    setSelectedDrugList(drugList);
    setIsDeactivateDialogOpen(true);
  };

  const handleConfirmActivate = () => {
    if (!selectedDrugList || !selectedDrugList.drug_list_id) {
      setError('No drug list selected. Please try again.');
      setIsActivateDialogOpen(false);
      return;
    }

    fetch(`${baseUrl}/drug-lists/${selectedDrugList.drug_list_id}/activate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        const contentType = res.headers.get('Content-Type');
        if (!res.ok) {
          if (contentType && contentType.includes('application/json')) {
            return res.json().then((data) => {
              throw new Error(data.error || 'Failed to activate drug list');
            });
          } else {
            throw new Error('Failed to activate drug list: Server returned an unexpected response');
          }
        }
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Failed to activate drug list: Server response is not JSON');
        }
      })
      .then(() => {
        setSuccess('Drug list activated successfully.');
        setTimeout(() => setSuccess(null), 3000);
        fetchDrugLists();
        setIsActivateDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error activating drug list:', error);
        setError(error.message || 'Failed to activate drug list. Please try again.');
        setIsActivateDialogOpen(false);
      });
  };

  const handleConfirmDeactivate = () => {
    if (!selectedDrugList || !selectedDrugList.drug_list_id) {
      setError('No drug list selected. Please try again.');
      setIsDeactivateDialogOpen(false);
      return;
    }

    fetch(`${baseUrl}/drug-lists/${selectedDrugList.drug_list_id}/deactivate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        const contentType = res.headers.get('Content-Type');
        if (!res.ok) {
          if (contentType && contentType.includes('application/json')) {
            return res.json().then((data) => {
              throw new Error(data.error || 'Failed to deactivate drug list');
            });
          } else {
            throw new Error('Failed to deactivate drug list: Server returned an unexpected response');
          }
        }
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Failed to deactivate drug list: Server response is not JSON');
        }
      })
      .then(() => {
        setSuccess('Drug list deactivated successfully.');
        setTimeout(() => setSuccess(null), 3000);
        fetchDrugLists();
        setIsDeactivateDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error deactivating drug list:', error);
        setError(error.message || 'Failed to deactivate drug list. Please try again.');
        setIsDeactivateDialogOpen(false);
      });
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Drug Lists</strong>
            <CButton color="primary" onClick={openModal}>
              {/* <CIcon icon={cilPlus} className="me-2" /> */}
              Add Drug List
            </CButton>
          </div>
          {success && (
            <CAlert
              color="success"
              className="mt-2 py-1 px-3"
              style={{
                fontSize: '0.9rem',
                lineHeight: '1.2',
                border: 'none',
                backgroundColor: '#d4edda',
                color: '#155724',
              }}
            >
              {success}
            </CAlert>
          )}
          {error && (
            <CAlert
              color="danger"
              className="mt-2 py-1 px-3"
              style={{
                fontSize: '0.9rem',
                lineHeight: '1.2',
                border: 'none',
                backgroundColor: '#f8d7da',
                color: '#721c24',
              }}
            >
              {error}
            </CAlert>
          )}
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <CSpinner color="primary" />
          ) : (
            <CTable hover striped bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Code</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {drugLists.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="4" className="text-center">
                      No drug lists found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  drugLists.map((item) => (
                    <CTableRow key={item.drug_list_id}>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>{item.code}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          className={
                            item.status === 'active'
                              ? 'bg-success'
                              : 'bg-danger'
                          }
                          style={{
                            padding: '0.25rem 1rem',
                            fontSize: '0.875rem',
                            borderRadius: '0.5rem',
                            pointerEvents: 'none',
                            color: '#fff',
                          }}
                        >
                          {(item.status || 'unknown').toUpperCase()}
                        </CButton>
                      </CTableDataCell>
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
                            <CDropdownItem onClick={() => handleViewDrugs(item.drug_list_id)}>
                              View Drugs
                            </CDropdownItem>
                            {item.status === 'active' ? (
                              <CDropdownItem onClick={() => handleDeactivate(item)}>
                                Deactivate
                              </CDropdownItem>
                            ) : (
                              <CDropdownItem onClick={() => handleActivate(item)}>
                                Activate
                              </CDropdownItem>
                            )}
                            <div
                              className="dropdown-separator"
                              style={{ borderTop: '1px solid #ccc', margin: '0.25rem 0' }}
                            ></div>
                            <CDropdownItem onClick={() => handleDelete(item.drug_list_id)}>
                              Delete
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
          {/* Modal for Adding Drug List */}
          {modalOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Drug List</h5>
                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {error && <CAlert color="danger">{error}</CAlert>}
                    {formLoading && <CSpinner color="primary" />}
                    <CForm onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Name</label>
                        <CFormInput
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter drug list name"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Code</label>
                        <CFormInput
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleChange}
                          required
                          placeholder="Enter drug list code"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Status</label>
                        <CFormSelect
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="active">ACTIVE</option>
                          <option value="inactive">INACTIVE</option>
                        </CFormSelect>
                      </div>
                    </CForm>
                  </div>
                  <div className="modal-footer">
                    <CButton color="secondary" onClick={closeModal} disabled={formLoading}>
                      Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleSubmit} disabled={formLoading}>
                      Save
                    </CButton>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Modal for Activation Confirmation */}
          {isActivateDialogOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Activation</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setIsActivateDialogOpen(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to activate "{selectedDrugList?.name}"?</p>
                  </div>
                  <div className="modal-footer">
                    <CButton
                      color="secondary"
                      onClick={() => setIsActivateDialogOpen(false)}
                    >
                      Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleConfirmActivate}>
                      Activate
                    </CButton>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Modal for Deactivation Confirmation */}
          {isDeactivateDialogOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Deactivation</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setIsDeactivateDialogOpen(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to deactivate "{selectedDrugList?.name}"?</p>
                  </div>
                  <div className="modal-footer">
                    <CButton
                      color="secondary"
                      onClick={() => setIsDeactivateDialogOpen(false)}
                    >
                      Cancel
                    </CButton>
                    <CButton color="danger" onClick={handleConfirmDeactivate}>
                      Deactivate
                    </CButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default DrugList;