import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CIcon from '@coreui/icons-react';
import { cilPlus } from '@coreui/icons';

const Payers = () => {
  const [payerList, setPayerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState(null);
  const [formData, setFormData] = useState({
    payer_name: '',
    email: '',
    address: '',
    contact_info: '',
    status: '',
  });
  const [viewFormData, setViewFormData] = useState({ payer_id: '' });
  const [registerFormData, setRegisterFormData] = useState({
    payer_id: '',
    user_name: '',
    code: '',
    password: '',
    status: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    fetchPayers();
  }, []);

  const fetchPayers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/payer`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch payers: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      const data = await response.json();
      if (data.success && data.data.payers) {
        const formattedData = data.data.payers.map((payer) => ({
          ...payer,
          status: (payer.status || 'active').toLowerCase(),
        }));
        setPayerList(formattedData);
      }
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Failed to fetch payers');
      setLoading(false);
    }
  };

  const openModal = () => {
    setModalOpen(true);
    setFormError(null);
    setSuccess(null);
    setFormData({
      payer_name: '',
      email: '',
      address: '',
      contact_info: '',
      status: '',
    });
  };

  const openUpdateModal = (payer) => {
    setSelectedPayer(payer);
    setUpdateModalOpen(true);
    setFormError(null);
    setSuccess(null);
    setFormData({
      payer_name: payer.payer_name,
      email: payer.email,
      address: payer.address || '',
      contact_info: payer.contact_info || '',
      status: payer.status,
    });
  };

  const openViewModal = (payer) => {
    setViewModalOpen(true);
    setViewFormData({ payer_id: payer.id });
    setFormError(null);
  };

  const openRegisterModal = (payer) => {
    setRegisterModalOpen(true);
    setRegisterFormData({ payer_id: payer.id, user_name: '', code: '', password: '', status: '' });
    setFormError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setUpdateModalOpen(false);
    setViewModalOpen(false);
    setRegisterModalOpen(false);
    setSelectedPayer(null);
    setFormError(null);
    setSuccess(null);
    setViewFormData({ payer_id: '' });
    setRegisterFormData({ payer_id: '', user_name: '', code: '', password: '', status: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewChange = (e) => {
    const { name, value } = e.target;
    setViewFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setSuccess(null);

    if (!formData.payer_name || !formData.email || !formData.status) {
      setFormError('Payer Name, Email, and Status are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      payer_name: formData.payer_name,
      email: formData.email,
      address: formData.address || undefined,
      contact_info: formData.contact_info || undefined,
      status: formData.status,
    };

    try {
      const response = await fetch(`${baseUrl}/payer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add payer');
      }
      const data = await response.json();
      setSuccess(data.message || 'Payer added successfully');
      setFormLoading(false);
      await fetchPayers();
      setTimeout(closeModal, 2000);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setFormError(error.message || 'Failed to add payer');
      setFormLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setSuccess(null);

    if (!formData.payer_name || !formData.email || !formData.status) {
      setFormError('Payer Name, Email, and Status are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      payer_name: formData.payer_name,
      email: formData.email,
      address: formData.address || undefined,
      contact_info: formData.contact_info || undefined,
      status: formData.status,
    };

    try {
      const response = await fetch(`${baseUrl}/payer/${selectedPayer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payer');
      }
      const data = await response.json();
      setSuccess(data.message || 'Payer updated successfully');
      setFormLoading(false);
      await fetchPayers();
      setTimeout(closeModal, 2000);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setFormError(error.message || 'Failed to update payer');
      setFormLoading(false);
    }
  };

  const handleViewSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    if (!viewFormData.payer_id) {
      setFormError('Payer ID is required');
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/payer/${viewFormData.payer_id}/ha-credential`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch HA credential');
      }
      const result = await response.json();
      if (result.success && result.data) {
        navigate(`/payers/${viewFormData.payer_id}/ha-credential`, { state: { credential: result.data } });
        closeModal();
      } else {
        setFormError(result.message || 'No HA credential found');
      }
    } catch (error) {
      setFormError(error.message || 'Failed to fetch HA credential');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    if (!registerFormData.payer_id || !registerFormData.user_name) {
      setFormError('Payer ID and User Name are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      payer_id: registerFormData.payer_id,
      user_name: registerFormData.user_name,
      code: registerFormData.code || undefined,
      password: registerFormData.password || undefined,
      status: registerFormData.status || 'active',
    };

    try {
      const response = await fetch(`${baseUrl}/health-authority/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register HA credential');
      }
      const result = await response.json();
      if (result.success && result.data.credential) {
        navigate(`/payers/${registerFormData.payer_id}/ha-credential`, { state: { credential: result.data.credential } });
        setSuccess('HA credential registered successfully');
        setTimeout(closeModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setFormError(result.message || 'Failed to register HA credential');
      }
    } catch (error) {
      setFormError(error.message || 'Failed to register HA credential');
    } finally {
      setFormLoading(false);
    }
  };

  const handleActivate = async (payer) => {
    if (!payer || !payer.id) {
      setError('No payer selected. Please try again.');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/payer/${payer.id}/activate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const contentType = response.headers.get('Content-Type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to activate payer');
        } else {
          throw new Error('Failed to activate payer: Server returned an unexpected response');
        }
      }
      if (contentType && contentType.includes('application/json')) {
        await response.json();
      } else {
        throw new Error('Failed to activate payer: Server response is not JSON');
      }
      setSuccess('Payer activated successfully.');
      setTimeout(() => setSuccess(null), 3000);
      await fetchPayers();
    } catch (error) {
      setError(error.message || 'Failed to activate payer. Please try again.');
    }
  };

  const handleDeactivate = async (payer) => {
    if (!payer || !payer.id) {
      setError('No payer selected. Please try again.');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/payer/${payer.id}/deactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const contentType = response.headers.get('Content-Type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to deactivate payer');
        } else {
          throw new Error('Failed to deactivate payer: Server returned an unexpected response');
        }
      }
      if (contentType && contentType.includes('application/json')) {
        await response.json();
      } else {
        throw new Error('Failed to deactivate payer: Server response is not JSON');
      }
      setSuccess('Payer deactivated successfully.');
      setTimeout(() => setSuccess(null), 3000);
      await fetchPayers();
    } catch (error) {
      setError(error.message || 'Failed to deactivate payer. Please try again.');
    }
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Payers List</strong>
            <CButton color="primary" onClick={openModal}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Payer
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
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Code</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {payerList.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="4" className="text-center">
                      No payers found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  payerList.map((payer) => (
                    <CTableRow key={payer.id}>
                      <CTableDataCell>{payer.payer_name}</CTableDataCell>
                      <CTableDataCell>{payer.contact_info || '-'}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          className={
                            payer.status === 'active'
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
                          {(payer.status || 'unknown').toUpperCase()}
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
                            <CDropdownItem onClick={() => openViewModal(payer)}>View HA Credential</CDropdownItem>
                            <CDropdownItem onClick={() => openRegisterModal(payer)}>Register HA Credential</CDropdownItem>
                            <CDropdownItem onClick={() => openUpdateModal(payer)}>Update Payer</CDropdownItem>
                            {payer.status === 'active' ? (
                              <CDropdownItem onClick={() => handleDeactivate(payer)}>
                                Deactivate
                              </CDropdownItem>
                            ) : (
                              <CDropdownItem onClick={() => handleActivate(payer)}>
                                Activate
                              </CDropdownItem>
                            )}
                          </CDropdownMenu>
                        </CDropdown>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
          {/* Modal for Adding Payer */}
          <CModal visible={modalOpen} onClose={closeModal} backdrop="static">
            <CModalHeader>
              <CModalTitle>Add New Payer</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {formError && <CAlert color="danger">{formError}</CAlert>}
              {formLoading && <CSpinner color="primary" />}
              <CForm onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Payer Name</label>
                  <CFormInput
                    type="text"
                    name="payer_name"
                    value={formData.payer_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter payer name"
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
                  <label className="form-label fw-bold">Address</label>
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
                    placeholder="Enter contact info"
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
          {/* Modal for Updating Payer */}
          <CModal visible={updateModalOpen} onClose={closeModal} backdrop="static">
            <CModalHeader>
              <CModalTitle>Update Payer</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {formError && <CAlert color="danger">{formError}</CAlert>}
              {formLoading && <CSpinner color="primary" />}
              <CForm onSubmit={handleUpdateSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Payer Name</label>
                  <CFormInput
                    type="text"
                    name="payer_name"
                    value={formData.payer_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter payer name"
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
                  <label className="form-label fw-bold">Address</label>
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
                    placeholder="Enter contact info"
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
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={closeModal} disabled={formLoading}>
                Cancel
              </CButton>
              <CButton color="primary" onClick={handleUpdateSubmit} disabled={formLoading}>
                Update
              </CButton>
            </CModalFooter>
          </CModal>
          {/* Modal for Viewing HA Credential */}
          <CModal visible={viewModalOpen} onClose={closeModal} backdrop="static">
            <CModalHeader>
              <CModalTitle>View HA Credential</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {formError && <CAlert color="danger">{formError}</CAlert>}
              {formLoading && <CSpinner color="primary" />}
              <CForm onSubmit={handleViewSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Payer ID</label>
                  <CFormInput
                    type="text"
                    name="payer_id"
                    value={viewFormData.payer_id}
                    onChange={handleViewChange}
                    required
                    placeholder="Enter payer ID"
                  />
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={closeModal} disabled={formLoading}>
                Cancel
              </CButton>
              <CButton color="primary" onClick={handleViewSubmit} disabled={formLoading}>
                View
              </CButton>
            </CModalFooter>
          </CModal>
          {/* Modal for Registering HA Credential */}
          <CModal visible={registerModalOpen} onClose={closeModal} backdrop="static">
            <CModalHeader>
              <CModalTitle>Register HA Credential</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {formError && <CAlert color="danger">{formError}</CAlert>}
              {formLoading && <CSpinner color="primary" />}
              <CForm onSubmit={handleRegisterSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Payer ID</label>
                  <CFormInput
                    type="text"
                    name="payer_id"
                    value={registerFormData.payer_id}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Enter payer ID"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">User Name</label>
                  <CFormInput
                    type="text"
                    name="user_name"
                    value={registerFormData.user_name}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Enter user name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Code</label>
                  <CFormInput
                    type="text"
                    name="code"
                    value={registerFormData.code}
                    onChange={handleRegisterChange}
                    placeholder="Enter code"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Password</label>
                  <CFormInput
                    type="password"
                    name="password"
                    value={registerFormData.password}
                    onChange={handleRegisterChange}
                    placeholder="Enter password"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Status</label>
                  <CFormSelect
                    name="status"
                    value={registerFormData.status}
                    onChange={handleRegisterChange}
                  >
                    <option value="">Select Status</option>
                    <option value="active">ACTIVE</option>
                    <option value="inactive">INACTIVE</option>
                  </CFormSelect>
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={closeModal} disabled={formLoading}>
                Cancel
              </CButton>
              <CButton color="primary" onClick={handleRegisterSubmit} disabled={formLoading}>
                Register
              </CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default Payers;