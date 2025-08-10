import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Alert, Spinner, Form } from 'react-bootstrap';
import api from '../../../../api';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = new URLSearchParams(location.search).get('redirectTo')
    ? decodeURIComponent(new URLSearchParams(location.search).get('redirectTo'))
    : '/dashboard/analytics';

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) navigate(redirectTo, { replace: true });
  }, [navigate, redirectTo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post('/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
      });

      if (res.data?.token) {
        const storage = formData.rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', res.data.token);
        navigate(redirectTo, { replace: true });
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="authentication-form">
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          disabled={isLoading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>
          <Link to="/auth/reset-pass" className="float-end text-muted text-unline-dashed ms-1">
            Reset password
          </Link>
          Password
        </Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
          label="Remember me"
          id="checkbox-signin"
          disabled={isLoading}
        />
      </Form.Group>

      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Sign In'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
