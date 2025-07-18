
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
} from '@coreui/react';
import { cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

const CliniciansTable = () => {
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    specialty: '',
    license_number: '',
    phone: '',
    status: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const listId = params.get('listId');
    const url = listId
      ? `${baseUrl}/clinicians?clinician_list_id=${listId}`
      : `${baseUrl}/clinicians`;

    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch clinicians: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setClinicians(data.data);
        } else {
          setClinicians([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching clinicians:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [location.search]);

  const handleViewClinician = (id) => {
    navigate(`/clinicians/${id}`);
  };

  const openModal = () => {
    setModalOpen(true);
    setError(null);
    setSuccess(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      specialty: '',
      license_number: '',
      phone: '',
      status: '',
    });
  };

  const closeModal = () => {
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
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.license_number || !formData.status) {
      setError('First Name, Last Name, Email, License Number, and Status are required');
      setFormLoading(false);
      return;
    }

    const params = new URLSearchParams(location.search);
    const clinician_list_id = params.get('listId') || null;

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      specialty: formData.specialty || null,
      license_number: formData.license_number,
      phone: formData.phone || null,
      status: formData.status,
      clinician_list_id: clinician_list_id,
    };

    fetch(`${baseUrl}/clinicians`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to add clinician: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccess(data.message || 'Clinician added successfully');
        setFormLoading(false);
        // Refresh the clinicians list
        const params = new URLSearchParams(location.search);
        const listId = params.get('listId');
        const url = listId
          ? `${baseUrl}/clinicians?clinician_list_id=${listId}`
          : `${baseUrl}/clinicians`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (data.data) {
              setClinicians(data.data);
            }
          });
        setTimeout(closeModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        console.error('Error adding clinician:', error);
        setError(error.message || 'Failed to add clinician');
        setFormLoading(false);
      });
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center w-100">
            <strong>Clinicians</strong>
            <CButton
              color="primary"
              onClick={openModal}
              style={{ padding: '2px 20px', fontSize: '12px', lineHeight: '1' }}
            >
              <CIcon icon={cilPlus} className="me-1" />
              Add
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
          {loading ? (
            <CSpinner color="primary" />
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover striped bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">First Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Last Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Specialty</CTableHeaderCell>
                  <CTableHeaderCell scope="col">License Number</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Phone</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {clinicians.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="8" className="text-center">
                      No clinicians found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  clinicians.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.first_name}</CTableDataCell>
                      <CTableDataCell>{item.last_name}</CTableDataCell>
                      <CTableDataCell>{item.email}</CTableDataCell>
                      <CTableDataCell>{item.specialty || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.license_number}</CTableDataCell>
                      <CTableDataCell>{item.phone || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.status}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex justify-content-center">
                          <CDropdown alignment="end">
                            <CDropdownToggle
                              color="light"
                              caret={false}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#f1f1f1',
                                border: 'none',
                                borderRadius: '4px',
                              }}
                            >
                              <span style={{ fontSize: '24px', cursor: 'pointer' }}>⋯</span>
                            </CDropdownToggle>
                            <CDropdownMenu>
                              <CDropdownItem onClick={() => handleViewClinician(item.id)}>
                                View Clinician
                              </CDropdownItem>
                              <CDropdownItem href={`/clinicians/${item.id}/edit`}>
                                Edit Clinician
                              </CDropdownItem>
                              <CDropdownItem
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this clinician?')) {
                                    return;
                                  }
                                  fetch(`${baseUrl}/clinicians/${item.id}`, {
                                    method: 'DELETE',
                                  })
                                    .then((result) => {
                                      if (!res.ok) throw new Error('Failed to delete clinician: ${res.statusText}');
                                      setClinicians(clinicians.filter((clinician) => clinician.id !== item.id));
                                    })
                                    .catch((error) => {
                                      console.error('Error deleting clinician', error);
                                      setError('Failed to delete clinician');
                                    });
                                }}
                              >
                                Delete Clinician
                              </CDropdownItem>
                            </CDropdownMenu>
                          </CDropdown>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
          {modalOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-content modal-dialog modal-dialog-centered">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Clinician</h5>
                  <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {error && <CAlert color="danger">{error}</CAlert>}
                  {formLoading && <CSpinner color="primary" />}
                  <CForm onSubmit={handleSubmit}>
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <label className="form-label fw-bold">First Name</label>
                          <CFormInput
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            placeholder="Enter first name"
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
                          <label className="form-label fw-bold">License Number</label>
                          <CFormInput
                            type="text"
                            name="license_number"
                            value={formData.license_number}
                            onChange={handleChange}
                            required
                            placeholder="Enter license number"
                          />
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Last Name</label>
                          <CFormInput
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            placeholder="Enter last name"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Specialty</label>
                          <CFormInput
                            type="text"
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            placeholder="Enter specialty (optional)"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Phone</label>
                          <CFormInput
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number (optional)"
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
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </CFormSelect>
                        </div>
                      </CCol>
                    </CRow>
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
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default CliniciansTable;
