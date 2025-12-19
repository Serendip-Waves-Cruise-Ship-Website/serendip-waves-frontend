import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      showSuccess('Login successful!');
      navigate('/dashboard');
    } else {
      showError(result.error);
    }
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center bg-gradient-purple">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="text-purple">Serendip Waves</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-gradient-purple w-100 mb-3">
                    Sign In
                  </button>
                  <div className="text-center">
                    <a href="/register" className="text-purple">Don't have an account? Register</a>
                  </div>
                </form>
                
                <hr className="my-4" />
                
                <div className="text-center">
                  <small className="text-muted">Demo Users:</small>
                  <div className="mt-2">
                    <button 
                      className="btn btn-sm btn-outline-secondary me-1 mb-1"
                      onClick={() => { setEmail('customer@demo.com'); setPassword('demo123'); }}
                    >
                      Customer
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary me-1 mb-1"
                      onClick={() => { setEmail('admin@demo.com'); setPassword('demo123'); }}
                    >
                      Admin
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary me-1 mb-1"
                      onClick={() => { setEmail('superadmin@demo.com'); setPassword('demo123'); }}
                    >
                      SuperAdmin
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary me-1 mb-1"
                      onClick={() => { setEmail('chef@demo.com'); setPassword('demo123'); }}
                    >
                      Chef
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary mb-1"
                      onClick={() => { setEmail('staff@demo.com'); setPassword('demo123'); }}
                    >
                      Staff
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
