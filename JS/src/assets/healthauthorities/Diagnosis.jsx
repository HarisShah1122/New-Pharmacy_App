
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

const Diagnosis = () => {
  const [diagnosisLists, setDiagnosisLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false); 
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false); 
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
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
    fetchDiagnosisLists();
  }, []);

  const fetchDiagnosisLists = () => {
    setLoading(true);
    setError(null);
    console.log('Fetching diagnosis lists');
    fetch(`${baseUrl}/diagnosis-list`)
      .then((res) => {
        console.log('GET /diagnosis-list response status:', res.status);
        if (!res.ok) throw new Error(`Failed to fetch diagnosis lists: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log('GET /diagnosis-list data:', data);
        if (data.data) {
          const formattedData = data.data.map((list) => ({
            ...list,
            status: (list.status || 'INACTIVE').toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          }));
          setDiagnosisLists(formattedData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching diagnosis lists:', error);
        setError(error.message || 'Failed to load diagnosis lists');
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

  const openEditModal = (diagnosis) => {
    console.log('Opening edit modal for diagnosis:', diagnosis);
    setSelectedDiagnosis(diagnosis);
    setFormData({
      name: diagnosis.name,
      code: diagnosis.code,
      status: diagnosis.status,
    });
    setEditModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeEditModal = () => {
    console.log('Closing edit modal');
    setEditModalOpen(false);
    setSelectedDiagnosis(null);
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
      diagnosisList: [
        {
          name: formData.name,
          code: formData.code,
          status: formData.status,
        },
      ],
    };
    console.log('POST /diagnosis-list payload:', payload);

    fetch(`${baseUrl}/diagnosis-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        console.log('POST /diagnosis-list response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to add diagnosis list: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('POST /diagnosis-list response:', data);
        setSuccess(data.message || 'Diagnosis list added successfully');
        setFormLoading(false);
        fetchDiagnosisLists();
        setTimeout(closeModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        console.error('Error adding diagnosis list:', error);
        setError(error.message || 'Failed to add diagnosis list');
        setFormLoading(false);
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedDiagnosis) return;

    console.log('Submitting edit form with data:', formData);
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
      name: formData.name,
      code: formData.code,
      status: formData.status,
    };
    console.log('PUT /diagnosis-list payload:', payload);

    fetch(`${baseUrl}/diagnosis-list/${selectedDiagnosis.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        console.log('PUT /diagnosis-list response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to update diagnosis list: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('PUT /diagnosis-list response:', data);
        setSuccess(data.message || 'Diagnosis list updated successfully');
        setFormLoading(false);
        fetchDiagnosisLists();
        setTimeout(closeEditModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        console.error('Error updating diagnosis list:', error);
        setError(error.message || 'Failed to update diagnosis list');
        setFormLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this diagnosis list?')) return;

    console.log('Deleting diagnosis list with id:', id);
    fetch(`${baseUrl}/diagnosis-list/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        console.log('DELETE /diagnosis-list response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to delete diagnosis list: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('DELETE /diagnosis-list response:', data);
        setSuccess(data.message || 'Diagnosis list deleted successfully');
        fetchDiagnosisLists();
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        console.error('Error deleting diagnosis list:', error);
        setError(error.message || 'Failed to delete diagnosis list');
      });
  };

  const handleViewDiagnoses = (listId) => {
    console.log('Navigating to diagnoses with listId:', listId);
    navigate(`/diagnoses?listId=${listId}`);
  };

  const handleActivate = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setIsActivateDialogOpen(true);
  };

  const handleDeactivate = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setIsDeactivateDialogOpen(true);
  };

  const handleConfirmActivate = () => {
    if (!selectedDiagnosis || !selectedDiagnosis.id) {
      setError('No diagnosis list selected. Please try again.');
      setIsActivateDialogOpen(false);
      return;
    }

    fetch(`${baseUrl}/diagnosis-list/${selectedDiagnosis.id}/activate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        const contentType = res.headers.get('Content-Type');
        if (!res.ok) {
          if (contentType && contentType.includes('application/json')) {
            return res.json().then((data) => {
              throw new Error(data.error || 'Failed to activate diagnosis list');
            });
          } else {
            throw new Error('Failed to activate diagnosis list: Server returned an unexpected response');
          }
        }
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Failed to activate diagnosis list: Server response is not JSON');
        }
      })
      .then(() => {
        setSuccess('Diagnosis list activated successfully.');
        setTimeout(() => setSuccess(null), 3000);
        fetchDiagnosisLists();
        setIsActivateDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error activating diagnosis list:', error);
        setError(error.message || 'Failed to activate diagnosis list. Please try again.');
        setIsActivateDialogOpen(false);
      });
  };

  const handleConfirmDeactivate = () => {
    if (!selectedDiagnosis || !selectedDiagnosis.id) {
      setError('No diagnosis list selected. Please try again.');
      setIsDeactivateDialogOpen(false);
      return;
    }

    fetch(`${baseUrl}/diagnosis-list/${selectedDiagnosis.id}/deactivate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        const contentType = res.headers.get('Content-Type');
        if (!res.ok) {
          if (contentType && contentType.includes('application/json')) {
            return res.json().then((data) => {
              throw new Error(data.error || 'Failed to deactivate diagnosis list');
            });
          } else {
            throw new Error('Failed to deactivate diagnosis list: Server returned an unexpected response');
          }
        }
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Failed to deactivate diagnosis list: Server response is not JSON');
        }
      })
      .then(() => {
        setSuccess('Diagnosis list deactivated successfully.');
        setTimeout(() => setSuccess(null), 3000);
        fetchDiagnosisLists();
        setIsDeactivateDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error deactivating diagnosis list:', error);
        setError(error.message || 'Failed to deactivate diagnosis list. Please try again.');
        setIsDeactivateDialogOpen(false);
      });
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Diagnosis Lists</strong>
            <CButton color="primary" onClick={openModal}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Diagnosis List
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
                {diagnosisLists.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="4" className="text-center">
                      No diagnosis lists found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  diagnosisLists.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>{item.code}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          className={
                            item.status === 'ACTIVE'
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
                          {item.status || 'UNKNOWN'}
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
                            <CDropdownItem onClick={() => handleViewDiagnoses(item.id)}>
                              View Diagnoses
                            </CDropdownItem>
                            {item.status === 'ACTIVE' ? (
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
                            <CDropdownItem onClick={() => openEditModal(item)}>
                              Edit
                            </CDropdownItem>
                            <CDropdownItem onClick={() => handleDelete(item.id)}>
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
          {/* Modal for Adding Diagnosis List */}
          {modalOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Diagnosis List</h5>
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
                          placeholder="Enter diagnosis list name"
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
                          placeholder="Enter diagnosis list code"
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
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
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
          {/* Modal for Editing Diagnosis List */}
          {editModalOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Diagnosis List</h5>
                    <button type="button" className="btn-close" onClick={closeEditModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {error && <CAlert color="danger">{error}</CAlert>}
                    {formLoading && <CSpinner color="primary" />}
                    <CForm onSubmit={handleEditSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Name</label>
                        <CFormInput
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter diagnosis list name"
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
                          placeholder="Enter diagnosis list code"
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
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </CFormSelect>
                      </div>
                    </CForm>
                  </div>
                  <div className="modal-footer">
                    <CButton color="secondary" onClick={closeEditModal} disabled={formLoading}>
                      Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleEditSubmit} disabled={formLoading}>
                      Update
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
                    <p>Are you sure you want to activate "{selectedDiagnosis?.name}"?</p>
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
                    <p>Are you sure you want to deactivate "{selectedDiagnosis?.name}"?</p>
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

export default Diagnosis;
