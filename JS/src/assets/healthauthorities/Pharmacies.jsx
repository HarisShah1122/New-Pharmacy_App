import React, { useState, useEffect } from 'react';
import {
  CRow,
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
  CSpinner,
  CAlert,
  CForm,
  CFormInput,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilHospital, cilPlus } from '@coreui/icons';

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('add'); 
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const [formData, setFormData] = useState({
    pharmacy_name: '',
    email: '',
    password: '',
    address: '',
    contact_info: '',
    healthAuthority: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/pharmacies`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch pharmacies: ${response.status} ${errorData.error || response.statusText}`);
      }
      const result = await response.json();
      setPharmacies(result.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch pharmacy data');
      setLoading(false);
    }
  };

  const openModal = (mode = 'add', pharmacy = null) => {
    setModalOpen(true);
    setMode(mode);
    setFormError(null);
    setSuccess(null);
    if (mode === 'edit' && pharmacy) {
      setSelectedPharmacyId(pharmacy.id);
      setFormData({
        pharmacy_name: pharmacy.pharmacy_name || '',
        email: pharmacy.email || '',
        password: '', 
        address: pharmacy.address || '',
        contact_info: pharmacy.contact_info || '',
        healthAuthority: pharmacy.healthAuthority || '',
      });
    } else {
      setSelectedPharmacyId(null);
      setFormData({
        pharmacy_name: '',
        email: '',
        password: '',
        address: '',
        contact_info: '',
        healthAuthority: '',
      });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setMode('add');
    setSelectedPharmacyId(null);
    setFormError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setSuccess(null);

    if (!formData.pharmacy_name || !formData.email) {
      setFormError('Pharmacy Name and Email are required');
      setFormLoading(false);
      return;
    }

    const payload = [{
      pharmacy_name: formData.pharmacy_name,
      email: formData.email,
      password: formData.password || undefined,
      address: formData.address || undefined,
      contact_info: formData.contact_info || undefined,
      healthAuthority: formData.healthAuthority || undefined,
    }];

    try {
      const url = mode === 'add' ? `${baseUrl}/register` : `${baseUrl}/pharmacies/${selectedPharmacyId}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${mode === 'add' ? 'add' : 'update'} pharmacy: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(data.message || `Pharmacy ${mode === 'add' ? 'added' : 'updated'} successfully`);
      setFormLoading(false);
      await fetchPharmacies();
      setTimeout(closeModal, 2000);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setFormError(error.message || `Failed to ${mode === 'add' ? 'add' : 'update'} pharmacy`);
      setFormLoading(false);
    }
  };

  const handleDelete = async (pharmacyId) => {
    if (!window.confirm('Are you sure you want to delete this pharmacy?')) {
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/pharmacies/${pharmacyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete pharmacy');
      }

      setSuccess('Pharmacy deleted successfully');
      await fetchPharmacies();
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setError(error.message || 'Failed to delete pharmacy');
    }
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Registered Pharmacies</strong>
              {/* <CIcon icon={cilHospital} className="ms-2" /> */}
            </div>
            <CButton color="primary" onClick={() => openModal('add')}>
              {/* <CIcon icon={cilPlus} className="me-2" /> */}
              Add Pharmacy
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
        </CCardHeader>
        <CCardBody>
          {loading && <CSpinner color="primary" />}
          {error && <CAlert color="danger">{error}</CAlert>}
          {!loading && !error && (
            <CTable striped responsive bordered hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Pharmacy Name</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Address</CTableHeaderCell>
                  <CTableHeaderCell>Contact Info</CTableHeaderCell>
                  <CTableHeaderCell>Health Authority</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {pharmacies.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">
                      No pharmacies found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  pharmacies.map((pharmacy) => (
                    <CTableRow key={pharmacy.id}>
                      <CTableDataCell>{pharmacy.pharmacy_name}</CTableDataCell>
                      <CTableDataCell>{pharmacy.email}</CTableDataCell>
                      <CTableDataCell>{pharmacy.address || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{pharmacy.contact_info || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{pharmacy.healthAuthority || 'N/A'}</CTableDataCell>
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
                            <CDropdownItem onClick={() => openModal('edit', pharmacy)}>
                              Edit Pharmacy
                            </CDropdownItem>
                            <CDropdownItem onClick={() => handleDelete(pharmacy.id)}>
                              Delete Pharmacy
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
          {/* Modal for Adding/Editing Pharmacy */}
          {modalOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{mode === 'add' ? 'Add New Pharmacy' : 'Edit Pharmacy'}</h5>
                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {formError && <CAlert color="danger">{formError}</CAlert>}
                    {formLoading && <CSpinner color="primary" />}
                    <CForm onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Pharmacy Name</label>
                        <CFormInput
                          type="text"
                          name="pharmacy_name"
                          value={formData.pharmacy_name}
                          onChange={handleChange}
                          required
                          placeholder="Enter pharmacy name"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Email</label>
                        <CFormInput
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Password (Optional)</label>
                        <CFormInput
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Address (Optional)</label>
                        <CFormInput
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter address"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Contact Info</label>
                        <CFormInput
                          type="text"
                          name="contact_info"
                          value={formData.contact_info}
                          onChange={handleChange}
                          required
                          placeholder="Enter contact info"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Health Authority (Optional)</label>
                        <CFormInput
                          type="text"
                          name="healthAuthority"
                          value={formData.healthAuthority}
                          onChange={handleChange}
                          placeholder="Enter health authority"
                        />
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
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default Pharmacies;