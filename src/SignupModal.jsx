import React, { useState } from "react";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignupModal = ({ isOpen, onClose, openLoginModal }) => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    dob: "",
    gender: "",
    email: "",
    passport: "",
    country: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({}); // <-- field-specific errors
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const sendOTP = async () => {
    try {
      const res = await axios.post("http://localhost/Project-I/backend/emailValidationOTP.php", { 
        email: form.email 
      });
      if (res.data.success) {
        setSentOtp(res.data.otp);
        toast.success("OTP sent to your email.");
        setOtpModalVisible(true);
      } else {
        toast.error(res.data.message || "Failed to send OTP.");
      }
    } catch {
      toast.error("Error sending OTP.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrors({});
    setIsLoading(true);

    // Field-specific validation
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = "You should enter your full name.";
    if (!form.phone) newErrors.phone = "Please provide your phone number.";
    if (!form.dob) newErrors.dob = "Enter your date of birth in mm/dd/yyyy format.";
    if (!form.gender) newErrors.gender = "Select your gender from the dropdown.";
    if (!form.email) newErrors.email = "Please enter a valid email address.";
    if (!form.country) newErrors.country = "Please select your country.";
    if (!form.password) newErrors.password = "You must create a password.";
    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    await sendOTP();
    setIsLoading(false);
  };

  const handleOtpSubmit = async () => {
    if (enteredOtp.toString().trim() !== sentOtp.toString().trim()) {
      toast.error("Incorrect OTP.");
      return;
    }

    setIsLoading(true);
    
    // Parse country and phone code
    let countryName = '';
    let phoneCode = '';
    let fullPhoneNumber = form.phone;
    
    if (form.country) {
      const [country, code] = form.country.split('|');
      countryName = country;
      phoneCode = code;
      // Combine phone code with phone number
      fullPhoneNumber = `${phoneCode}${form.phone}`;
    }
    
    // Prepare form data for registration
    const formData = new FormData();
    formData.append("name", form.fullName);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("phone_number", fullPhoneNumber);
    formData.append("date_of_birth", form.dob);
    formData.append("gender", form.gender);
    if (form.passport) {
      formData.append("passport_number", form.passport);
    }
    if (countryName) {
      formData.append("country", countryName);
    }

    try {
      const res = await axios.post("http://localhost/Project-I/backend/customersignup.php", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.status === "success") {
        toast.success("Registration successful!");
        setSuccess("Account created successfully!");
        setForm({
          fullName: "",
          phone: "",
          dob: "",
          gender: "",
          email: "",
          passport: "",
          country: "",
          password: "",
          confirmPassword: ""
        });
        setTimeout(() => {
          setOtpModalVisible(false);
          onClose();
          if (openLoginModal) openLoginModal();
        }, 1500);
      } else {
        toast.error(res.data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      if (err.response) {
        toast.error(`Server Error: ${err.response.data.message || "Check PHP error log"}`);
      } else if (err.request) {
        toast.error("No response from server. Check if PHP backend is running.");
      } else {
        toast.error("Request setup error.");
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      <div style={overlayStyle}>
        <div className="card border-0 shadow-lg position-relative" style={cardStyle}>
          <button style={closeBtnStyle} onClick={onClose}>&times;</button>
          <div className="card-body p-2">
            <div className="text-center mb-3">
              <img src="/logo.png" alt="Serendip Waves Logo" width="80" height="80" className="mb-2" />
              <h2 className="fw-bold mb-0 text-white">Sign Up for Serendip Waves</h2>
              <p className="text-white-50 mb-0">Create your account and start your cruise adventure</p>
            </div>
            {error && <div className="alert alert-danger text-center py-2">{error}</div>}
            {success && <div className="alert alert-success text-center py-2">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold text-white mb-1">Full Name *</label>
                  <input type="text" className="form-control form-control-lg" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" style={inputStyle} />
                  {errors.fullName && <div className="text-danger small mt-1">{errors.fullName}</div>}
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold text-white mb-1">Phone Number *</label>
                  <div className="input-group">
                    <select 
                      className="form-select" 
                      name="country" 
                      value={form.country} 
                      onChange={handleChange} 
                      style={{...inputStyle, maxWidth: '140px', borderRadius: '10px 0 0 10px'}}
                      required
                    >
                      <option value="" disabled>Select Country</option>
                      <option value="Sri Lanka|+94">Sri Lanka +94</option>
                      <option value="India|+91">India +91</option>
                      <option value="United States|+1">United States +1</option>
                      <option value="United Kingdom|+44">United Kingdom +44</option>
                      <option value="Canada|+1">Canada +1</option>
                      <option value="Australia|+61">Australia +61</option>
                      <option value="Germany|+49">Germany +49</option>
                      <option value="France|+33">France +33</option>
                      <option value="Japan|+81">Japan +81</option>
                      <option value="China|+86">China +86</option>
                      <option value="Pakistan|+92">Pakistan +92</option>
                      <option value="Bangladesh|+880">Bangladesh +880</option>
                      <option value="Afghanistan|+93">Afghanistan +93</option>
                      <option value="Malaysia|+60">Malaysia +60</option>
                      <option value="Singapore|+65">Singapore +65</option>
                      <option value="Thailand|+66">Thailand +66</option>
                      <option value="Philippines|+63">Philippines +63</option>
                      <option value="Indonesia|+62">Indonesia +62</option>
                      <option value="South Korea|+82">South Korea +82</option>
                      <option value="Italy|+39">Italy +39</option>
                      <option value="Spain|+34">Spain +34</option>
                      <option value="Netherlands|+31">Netherlands +31</option>
                      <option value="Belgium|+32">Belgium +32</option>
                      <option value="Switzerland|+41">Switzerland +41</option>
                      <option value="Austria|+43">Austria +43</option>
                      <option value="Sweden|+46">Sweden +46</option>
                      <option value="Norway|+47">Norway +47</option>
                      <option value="Denmark|+45">Denmark +45</option>
                      <option value="Finland|+358">Finland +358</option>
                      <option value="Brazil|+55">Brazil +55</option>
                      <option value="Mexico|+52">Mexico +52</option>
                      <option value="Argentina|+54">Argentina +54</option>
                      <option value="Chile|+56">Chile +56</option>
                      <option value="South Africa|+27">South Africa +27</option>
                      <option value="Egypt|+20">Egypt +20</option>
                      <option value="Nigeria|+234">Nigeria +234</option>
                      <option value="Kenya|+254">Kenya +254</option>
                      <option value="Morocco|+212">Morocco +212</option>
                      <option value="New Zealand|+64">New Zealand +64</option>
                      <option value="Russia|+7">Russia +7</option>
                      <option value="Turkey|+90">Turkey +90</option>
                      <option value="Israel|+972">Israel +972</option>
                      <option value="UAE|+971">UAE +971</option>
                      <option value="Saudi Arabia|+966">Saudi Arabia +966</option>
                      <option value="Qatar|+974">Qatar +974</option>
                      <option value="Kuwait|+965">Kuwait +965</option>
                      <option value="Bahrain|+973">Bahrain +973</option>
                      <option value="Oman|+968">Oman +968</option>
                      <option value="Jordan|+962">Jordan +962</option>
                      <option value="Lebanon|+961">Lebanon +961</option>
                      <option value="Iran|+98">Iran +98</option>
                      <option value="Iraq|+964">Iraq +964</option>
                      <option value="Nepal|+977">Nepal +977</option>
                      <option value="Bhutan|+975">Bhutan +975</option>
                      <option value="Myanmar|+95">Myanmar +95</option>
                      <option value="Cambodia|+855">Cambodia +855</option>
                      <option value="Laos|+856">Laos +856</option>
                      <option value="Vietnam|+84">Vietnam +84</option>
                      <option value="Mongolia|+976">Mongolia +976</option>
                      <option value="Kazakhstan|+7">Kazakhstan +7</option>
                      <option value="Uzbekistan|+998">Uzbekistan +998</option>
                      <option value="Kyrgyzstan|+996">Kyrgyzstan +996</option>
                      <option value="Tajikistan|+992">Tajikistan +992</option>
                      <option value="Turkmenistan|+993">Turkmenistan +993</option>
                      <option value="Georgia|+995">Georgia +995</option>
                      <option value="Armenia|+374">Armenia +374</option>
                      <option value="Azerbaijan|+994">Azerbaijan +994</option>
                    </select>
                    <input 
                      type="tel" 
                      className="form-control form-control-lg" 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      placeholder="Enter phone number" 
                      style={{...inputStyle, borderRadius: '0 10px 10px 0', borderLeft: 'none'}} 
                    />
                  </div>
                  {errors.phone && <div className="text-danger small mt-1">{errors.phone}</div>}
                  {errors.country && <div className="text-danger small mt-1">{errors.country}</div>}
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold text-white mb-1">Date of Birth *</label>
                  <input type="date" className="form-control form-control-lg" name="dob" value={form.dob} onChange={handleChange} style={inputStyle} />
                  {errors.dob && <div className="text-danger small mt-1">{errors.dob}</div>}
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold text-white mb-1">Gender *</label>
                  <select className="form-select form-select-lg" name="gender" value={form.gender} onChange={handleChange} style={{...inputStyle, minWidth: '100%', width: '100%'}} required>
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <div className="text-danger small mt-1">{errors.gender}</div>}
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold text-white mb-1">Email Address *</label>
                  <input type="email" className="form-control form-control-lg" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" style={inputStyle} />
                  {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold text-white mb-1">Passport Number (optional)</label>
                  <input type="text" className="form-control form-control-lg" name="passport" value={form.passport} onChange={handleChange} placeholder="Enter your passport number" style={inputStyle} />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold text-white mb-1">Password *</label>
                  <div className="position-relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-control form-control-lg" 
                      name="password" 
                      value={form.password} 
                      onChange={handleChange} 
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="Create a password" 
                      style={inputStyle} 
                    />
                    <span 
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        right: '15px', 
                        transform: 'translateY(-50%)', 
                        cursor: 'pointer', 
                        zIndex: 2,
                        color: 'rgba(255,255,255,0.7)'
                      }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </span>
                  </div>
                  {passwordFocused && (
                    <div className="text-white small mt-1" style={{opacity:0.85}}>
                      Password must be at least 6 characters long, include uppercase and lowercase letters, at least one number, and one special character.
                    </div>
                  )}
                  {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold text-white mb-1">Confirm Password *</label>
                  <div className="position-relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className="form-control form-control-lg" 
                      name="confirmPassword" 
                      value={form.confirmPassword} 
                      onChange={handleChange} 
                      placeholder="Confirm your password" 
                      style={inputStyle} 
                    />
                    <span 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        right: '15px', 
                        transform: 'translateY(-50%)', 
                        cursor: 'pointer', 
                        zIndex: 2,
                        color: 'rgba(255,255,255,0.7)'
                      }}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </span>
                  </div>
                  {errors.confirmPassword && <div className="text-danger small mt-1">{errors.confirmPassword}</div>}
                </div>
              </div>
              <div className="d-grid mb-3">
                <button 
                  type="submit" 
                  className="btn btn-warning btn-lg fw-bold" 
                  style={buttonStyle}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
              <div className="text-center">
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Already have an account?{' '}
                  <span
                    className="fw-semibold"
                    style={{ color: '#ffd600', cursor: 'pointer' }}
                    onClick={() => {
                      onClose();
                      if (openLoginModal) openLoginModal();
                    }}
                  >
                    Sign in here
                  </span>
                </span>
              </div>
            </form>
          </div>
        </div>
        <style>{`
          .form-control:focus, .form-select:focus {
            background: rgba(255,255,255,0.2) !important;
            border-color: #ffd600 !important;
            box-shadow: 0 0 0 0.2rem rgba(255, 214, 0, 0.25) !important;
            color: #fff !important;
            backdrop-filter: blur(15px) !important;
          }
          .form-control::placeholder { color: rgba(255,255,255,0.6) !important; }
          .form-select option {
            color: #000 !important;
            background: #fff !important;
          }
          .btn-warning:hover:not(:disabled) {
            background: rgba(255, 193, 7, 1) !important;
            border-color: rgba(255, 193, 7, 1) !important;
            transform: translateY(-2px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
          }
          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
          }
          .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 20px;
            padding: 1px;
            background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
          }
          @media (max-width: 600px) {
            .card-body {
              max-height: 70vh;
              overflow-y: auto;
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* IE 10+ */
            }
            .card-body::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
          }
        `}</style>
      </div>

      {/* OTP Modal */}
      {otpModalVisible && (
        <div style={overlayStyle}>
          <div className="card border-0 shadow-lg position-relative" style={{...cardStyle, maxWidth: '400px'}}>
            <button style={closeBtnStyle} onClick={() => setOtpModalVisible(false)}>&times;</button>
            <div className="card-body p-4">
              <div className="text-center mb-3">
                <h3 className="fw-bold mb-0 text-white">Verify OTP</h3>
                <p className="text-white-50 mb-3">Enter the OTP sent to your email</p>
              </div>
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control form-control-lg text-center" 
                  value={enteredOtp} 
                  onChange={e => setEnteredOtp(e.target.value)} 
                  placeholder="Enter OTP"
                  style={inputStyle}
                  maxLength="6"
                />
              </div>
              <div className="d-grid gap-2">
                <button 
                  type="button"
                  className="btn btn-warning btn-lg fw-bold" 
                  style={buttonStyle}
                  onClick={handleOtpSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <button 
                    type="button"
                    className="btn btn-outline-light btn-lg" 
                    onClick={() => setOtpModalVisible(false)}
                    style={{
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      display: 'inline-block',
                      minWidth: 120
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.45)",
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cardStyle = {
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.13)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  backdropFilter: "blur(20px)",
  border: "1.5px solid rgba(255,255,255,0.18)",
  color: "#fff",
  maxWidth: '800px',
  minWidth: '500px',
  width: '100%',
  position: 'relative',
  padding: '12px 16px',
  boxSizing: 'border-box',
  margin: 'auto',
  display: 'block',
  marginTop: '64px', // add space from navbar
};

const closeBtnStyle = {
  position: "absolute",
  top: 18,
  right: 22,
  background: "none",
  border: "none",
  fontSize: 32,
  color: "#fff",
  cursor: "pointer",
  zIndex: 2
};

const inputStyle = {
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  backdropFilter: 'blur(10px)'
};

const buttonStyle = {
  borderRadius: '10px',
  fontSize: '1.1rem',
  padding: '12px',
  background: 'rgba(255, 193, 7, 0.9)',
  border: '1px solid rgba(255, 193, 7, 0.3)',
  backdropFilter: 'blur(10px)',
  color: '#000',
  fontWeight: 700,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default SignupModal; 