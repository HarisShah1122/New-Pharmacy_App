import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Alert, Spinner, FormCheck } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../../../../../api';

const SignUpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get('redirectTo')
    ? decodeURIComponent(new URLSearchParams(location.search).get('redirectTo'))
    : '/dashboard/analytics';

  const healthAuthorities = [
    { value: '', label: 'Select Health Authority', disabled: true },
    { value: 'NHS', label: 'National Health Service (NHS)' },
    { value: 'HHS', label: 'U.S. Department of Health and Human Services (HHS)' },
    { value: 'PHAC', label: 'Public Health Agency of Canada (PHAC)' },
    { value: 'WHO', label: 'World Health Organization (WHO)' },
  ];

  const signUpSchema = yup.object({
    firstname: yup.string().required('Please enter your first name').min(2),
    lastname: yup.string().required('Please enter your last name').min(2),
    email: yup.string().email('Please enter a valid email').required(),
    password: yup.string().min(6, 'Password must be at least 6 characters').required(),
    repeatPassword: yup
      .string()
      .required('Please repeat your password')
      .oneOf([yup.ref('password')], 'Passwords do not match'),
    healthAuthority: yup
      .string()
      .required('Please select a health authority')
      .oneOf(healthAuthorities.filter((o) => !o.disabled).map((o) => o.value)),
    termsAccepted: yup.boolean().oneOf([true], 'You must accept the Terms and Conditions'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      repeatPassword: '',
      healthAuthority: '',
      termsAccepted: false,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) navigate(redirectTo, { replace: true });
  }, [navigate, redirectTo]);

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/signup', {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password.trim(),
        repeatPassword: data.repeatPassword.trim(),
        healthAuthority: data.healthAuthority.trim(),
      });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        reset();
        navigate(redirectTo, { replace: true });
      } else {
        alert('Unexpected response from server.');
      }
    } catch (err) {
      let errorMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
      if (err.response?.data?.details) {
        errorMessage = err.response.data.details.map((e) => e.msg).join(', ');
      }
      alert(errorMessage);
    }
  };

  return (
    <form className="authentication-form" onSubmit={handleSubmit(onSubmit)}>
      {Object.keys(errors).length > 0 && (
        <Alert variant="danger">
          {Object.values(errors).map((err) => err.message).join(', ')}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>First Name</Form.Label>
        <Form.Control {...register('firstname')} placeholder="Enter your first name" />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last Name</Form.Label>
        <Form.Control {...register('lastname')} placeholder="Enter your last name" />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control {...register('email')} placeholder="Enter your email" />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" {...register('password')} placeholder="Enter your password" />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Repeat Password</Form.Label>
        <Form.Control
          type="password"
          {...register('repeatPassword')}
          placeholder="Repeat your password"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Health Authority</Form.Label>
        <Form.Select {...register('healthAuthority')}>
          {healthAuthorities.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <FormCheck label="I accept Terms and Conditions" {...register('termsAccepted')} />
      </Form.Group>

      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Sign Up'}
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
