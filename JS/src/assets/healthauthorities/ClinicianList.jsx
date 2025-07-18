
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

const ClinicianList = () => {
  const [clinicianLists, setClinicianLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: '',
  });
  const [importData, setImportData] = useState({
    file: null,
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    fetchClinicianLists();
  }, []);

  const fetchClinicianLists = () => {
    setLoading(true);
    setError(null);
    fetch(`${baseUrl}/clinician-lists`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch clinician lists: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          const formattedData = data.data.map((list) => ({
            ...list,
            status: typeof list.status === 'object' && list.status !== null
              ? (list.status.is_active ? 'ACTIVE' : 'INACTIVE')
              : (list.status || '').toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          }));
          setClinicianLists(formattedData);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message || 'Failed to load clinician lists');
        setLoading(false);
      });
  };

  const openModal = () => {
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
    setModalOpen(false);
    setError(null);
    setSuccess(null);
  };

  const openEditModal = (clinician) => {
    setSelectedClinician(clinician);
    setFormData({
      name: clinician.name,
      code: clinician.code,
      status: clinician.status,
    });
    setEditModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedClinician(null);
    setError(null);
    setSuccess(null);
  };

  const openImportModal = () => {
    setImportModalOpen(true);
    setError(null);
    setSuccess(null);
    setImportData({
      file: null,
      password: '',
    });
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImportChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setImportData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setImportData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.code || !formData.status) {
      setError('Name, Code, and Status are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      status: formData.status,
    };

    fetch(`${baseUrl}/clinician-lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to add clinician list: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccess(data.message || 'Clinician list added successfully');
        setFormLoading(false);
        fetchClinicianLists();
        setTimeout(closeModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        setError(error.message || 'Failed to add clinician list');
        setFormLoading(false);
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedClinician) return;

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.code || !formData.status) {
      setError('Name, Code, and Status are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      status: formData.status,
    };

    fetch(`${baseUrl}/clinician-lists/${selectedClinician.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to update clinician list: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccess(data.message || 'Clinician list updated successfully');
        setFormLoading(false);
        fetchClinicianLists();
        setTimeout(closeEditModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        setError(error.message || 'Failed to update clinician list');
        setFormLoading(false);
      });
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    if (!importData.file) {
      setError('Please select a file to import');
      setFormLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', importData.file);
    formData.append('password', importData.password);

    fetch(`${baseUrl}/clinicians/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to import clinicians: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccess(data.message || 'Clinicians imported successfully');
        setFormLoading(false);
        fetchClinicianLists();
        setTimeout(closeImportModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        setError(error.message || 'Failed to import clinicians');
        setFormLoading(false);
      });
  };

  const handleDelete = (listId) => {
    if (!window.confirm('Are you sure you want to delete this clinician list?')) return;

    fetch(`${baseUrl}/clinician-lists/${listId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to delete clinician list: ${res.statusText}`);
          });
        }
        setClinicianLists(clinicianLists.filter((list) => list.id !== listId));
        setSuccess('Clinician list deleted successfully');
        setTimeout(() => setSuccess(null), 5000);
        return res.json();
      })
      .catch((error) => {
        setError(error.message || 'Failed to delete clinician list');
        fetchClinicianLists();
      });
  };

  const handleViewClinicians = (listId) => {
    navigate(`/clinicians?listId=${listId}`);
  };

  const handleDownloadTemplate = () => {
    window.location.href = `${baseUrl}/clinicians/template`;
  };

  const handleActivate = (clinician) => {
    setSelectedClinician(clinician);
    setIsActivateDialogOpen(true);
  };

  const handleDeactivate = (clinician) => {
    setSelectedClinician(clinician);
    setIsDeactivateDialogOpen(true);
  };

  const handleConfirmActivate = () => {
    if (!selectedClinician || !selectedClinician.id) {
      setError('No clinician list selected. Please try again.');
      setIsActivateDialogOpen(false);
      return;
    }

    fetch(`${baseUrl}/clinician-lists/${selectedClinician.id}/activate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((res) => {
        const contentType = res.headers.get('Content-Type');
        if (!res.ok) {
          if (contentType && contentType.includes('application/json')) {
            return res.json().then((data) => {
              throw new Error(data.error || 'Failed to activate clinician list');
            });
          } else {
            throw new Error('Failed to activate clinician list: Server returned an unexpected response');
          }
        }
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Failed to activate clinician list: Server response is not JSON');
        }
      })
      .then(() => {
        setSuccess('Clinician list activated successfully.');
        setTimeout(() => setSuccess(null), 3000);
        fetchClinicianLists();
        setIsActivateDialogOpen(false);
      })
      .catch((error) => {
        setError(error.message || 'Failed to activate clinician list. Please try again.');
        setIsActivateDialogOpen(false);
      });
  };

  const handleConfirmDeactivate = () => {
    if (!selectedClinician || !selectedClinician.id) {
      setError('No clinician list selected. Please try again.');
      setIsDeactivateDialogOpen(false);
      return;
    }

    fetch(`${baseUrl}/clinician-lists/${selectedClinician.id}/deactivate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((res) => {
        const contentType = res.headers.get('Content-Type');
        if (!res.ok) {
          if (contentType && contentType.includes('application/json')) {
            return res.json().then((data) => {
              throw new Error(data.error || 'Failed to deactivate clinician list');
            });
          } else {
            throw new Error('Failed to deactivate clinician list: Server returned an unexpected response');
          }
        }
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Failed to deactivate clinician list: Server response is not JSON');
        }
      })
      .then(() => {
        setSuccess('Clinician list deactivated successfully.');
        setTimeout(() => setSuccess(null), 3000);
        fetchClinicianLists();
        setIsDeactivateDialogOpen(false);
      })
      .catch((error) => {
        setError(error.message || 'Failed to deactivate clinician list. Please try again.');
        setIsDeactivateDialogOpen(false);
      });
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center w-100">
            <strong>Clinician Lists</strong>
            <div className="d-flex gap-2">
              <CDropdown alignment="start">
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
                  <span style={{ cursor: 'pointer' }}>⋯</span>
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={openImportModal}>
                    Import Clinicians
                  </CDropdownItem>
                  <CDropdownItem onClick={handleDownloadTemplate}>
                    Download Template
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
              <CButton color="primary" onClick={openModal}>
                {/* <CIcon icon={cilPlus} className="me-2" /> */}
                Add Clinician List
              </CButton>
            </div>
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
                {clinicianLists.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="4" className="text-center">
                      No clinician lists found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  clinicianLists.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>
                        {typeof item.code === 'object' && item.code !== null
                          ? item.code.value || JSON.stringify(item.code)
                          : item.code || '-'}
                      </CTableDataCell>
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
                            <CDropdownItem onClick={() => handleViewClinicians(item.id)}>
                              View Clinicians
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
          {modalOpen && (
            <CModal visible={modalOpen} onClose={closeModal} alignment="center">
              <CModalHeader>
                <CModalTitle>Add New Clinician List</CModalTitle>
              </CModalHeader>
              <CModalBody>
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
                      placeholder="Enter clinician list name"
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
                      placeholder="Enter clinician list code"
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
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={closeModal} disabled={formLoading}>
                  Cancel
                </CButton>
                <CButton color="primary" onClick={handleSubmit} disabled={formLoading}>
                  Save
                </CButton>
              </CModalFooter>
            </CModal>
          )}
          {editModalOpen && (
            <CModal visible={editModalOpen} onClose={closeEditModal} alignment="center">
              <CModalHeader>
                <CModalTitle>Edit Clinician List</CModalTitle>
              </CModalHeader>
              <CModalBody>
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
                      placeholder="Enter clinician list name"
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
                      placeholder="Enter clinician list code"
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
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={closeEditModal} disabled={formLoading}>
                  Cancel
                </CButton>
                <CButton color="primary" onClick={handleEditSubmit} disabled={formLoading}>
                  Update
                </CButton>
              </CModalFooter>
            </CModal>
          )}
          {importModalOpen && (
            <CModal visible={importModalOpen} onClose={closeImportModal} alignment="center">
              <CModalHeader>
                <CModalTitle>Import Clinicians</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {error && <CAlert color="danger">{error}</CAlert>}
                {formLoading && <CSpinner color="primary" />}
                <p>Choose file to import clinicians to this list. You can select ONLY one file at a time.</p>
                <CForm onSubmit={handleImportSubmit}>
                  <div className="mb-3">
                    <CFormInput
                      type="file"
                      name="file"
                      onChange={handleImportChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <CFormInput
                      type="password"
                      name="password"
                      value={importData.password}
                      onChange={handleImportChange}
                      placeholder="password"
                    />
                  </div>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={closeImportModal} disabled={formLoading}>
                  Cancel
                </CButton>
                <CButton color="primary" onClick={handleImportSubmit} disabled={formLoading}>
                  Import Clinicians
                </CButton>
              </CModalFooter>
            </CModal>
          )}
          {isActivateDialogOpen && (
            <CModal visible={isActivateDialogOpen} onClose={() => setIsActivateDialogOpen(false)} alignment="center">
              <CModalHeader>
                <CModalTitle>Confirm Activation</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <p>Are you sure you want to activate "{selectedClinician?.name}"?</p>
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() => setIsActivateDialogOpen(false)}
                >
                  Cancel
                </CButton>
                <CButton color="primary" onClick={handleConfirmActivate}>
                  Activate
                </CButton>
              </CModalFooter>
            </CModal>
          )}
          {isDeactivateDialogOpen && (
            <CModal visible={isDeactivateDialogOpen} onClose={() => setIsDeactivateDialogOpen(false)} alignment="center">
              <CModalHeader>
                <CModalTitle>Confirm Deactivation</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <p>Are you sure you want to deactivate "{selectedClinician?.name}"?</p>
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() => setIsDeactivateDialogOpen(false)}
                >
                  Cancel
                </CButton>
                <CButton color="danger" onClick={handleConfirmDeactivate}>
                  Deactivate
                </CButton>
              </CModalFooter>
            </CModal>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default ClinicianList;
