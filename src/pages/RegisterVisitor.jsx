import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "../components/Sidebar"; // Admin Sidebar
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import { 
  User, Mail, Phone, Building, Calendar, Clock, 
  CheckCircle, ArrowLeft, ArrowRight, CreditCard, 
  Send, X, ChevronDown, UploadCloud
} from 'lucide-react';

const RegisterVisitor = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', company: '',
    purpose: '', host: '', hostEmail: '',
    date: '', time: '', idType: '', idNumber: '', photo: null
  });

  // Validation Error State
  const [errors, setErrors] = useState({});

  // File Upload State
  const [photoFile, setPhotoFile] = useState(null); 
  const fileInputRef = useRef(null);

  // Dropdown & API State
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Visit Details', icon: Building },
    { number: 3, title: 'ID & Photo', icon: CreditCard },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  const purposeOptions = ['Business Meeting', 'Interview', 'Client Visit', 'Delivery', 'Maintenance', 'Other'];
  const idTypes = ['Driver License', 'Passport', 'Government ID', 'Employee ID', 'Other'];

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await fetch('http://localhost:5260/api/auth/employees');
        if (res.ok) setEmployees(await res.json());
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // ── SAFE LOCAL DATE HELPERS ──
  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ── HANDLE INPUT CHANGES ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear the specific error when the user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }

    if (name === 'phone') {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numbersOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectEmployee = (emp) => {
    setFormData({ ...formData, host: emp.fullName, hostEmail: emp.email });
    setDropdownOpen(false);
    if (errors.host) setErrors({ ...errors, host: null });
  };

  // ── FILE UPLOAD LOGIC ──
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: "File is too large. Please select an image under 5MB." });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
        if (errors.photo) setErrors({ ...errors, photo: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── EXPLICIT VALIDATION LIKE GOOGLE FORMS ──
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.fullName.trim()) { newErrors.fullName = "Full Name is required."; isValid = false; }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = "Enter a valid email address."; isValid = false; }
      if (formData.phone.length !== 10) { newErrors.phone = "Mobile number must be strictly 10 digits."; isValid = false; }
    } 
    else if (step === 2) {
      if (!formData.company.trim()) { newErrors.company = "Company name is required."; isValid = false; }
      if (!formData.purpose.trim()) { newErrors.purpose = "Please select a purpose."; isValid = false; }
      if (!formData.host.trim()) { newErrors.host = "Please select a host employee."; isValid = false; }
      
      const today = getLocalToday();
      const maxDate = getMaxDate();

      if (!formData.date) {
        newErrors.date = "Date is required."; isValid = false;
      } else if (formData.date < today) {
        newErrors.date = "Select a Valid date."; isValid = false;
      } else if (formData.date > maxDate) {
        newErrors.date = "Cannot schedule more than 1 year in advance."; isValid = false;
      }

      if (!formData.time) {
        newErrors.time = "Time is required."; isValid = false;
      } else if (formData.date === today) {
        const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM
        if (formData.time < currentTime) {
          newErrors.time = "Cannot select a past time for today."; isValid = false;
        }
      }
    } 
    else if (step === 3) {
      if (!formData.idType) { newErrors.idType = "ID Type is required."; isValid = false; }
      if (!formData.idNumber.trim()) { newErrors.idNumber = "ID Number is required."; isValid = false; }
      if (!formData.photo) { newErrors.photo = "A visitor photo is required."; isValid = false; }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => { 
    if (currentStep > 1) {
      setErrors({}); // Clear errors when going back
      setCurrentStep(currentStep - 1); 
    }
  };

  // ── SUBMISSION ──
  const handleSubmitRequest = async () => {
    if (!validateStep(3)) return; // Final safety check

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('company', formData.company);
      submitData.append('purpose', formData.purpose);
      submitData.append('host', formData.host);
      submitData.append('hostEmail', formData.hostEmail);
      submitData.append('date', formData.date);
      submitData.append('time', formData.time);
      submitData.append('idType', formData.idType);
      submitData.append('idNumber', formData.idNumber);
      submitData.append('registeredBy', 'Admin'); 

      if (photoFile) submitData.append('photo', photoFile);

      const response = await fetch('http://localhost:5260/api/visitors/register', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        alert('Visitor successfully pre-registered and Approved!');
        setCurrentStep(1);
        setFormData({
          fullName: '', email: '', phone: '', company: '',
          purpose: '', host: '', hostEmail: '',
          date: '', time: '', idType: '', idNumber: '', photo: null
        });
        setPhotoFile(null);
        setErrors({});
      } else {
        const errorData = await response.json();
        alert(`Failed to register visitor: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error connecting to backend!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header title="Pre-Register Visitor" subtitle="Admin file-based registration" />

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 my-6">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentStep === step.number
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.number
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  <step.icon className="w-3.5 h-3.5" />
                  {step.title}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 w-8 rounded ${currentStep > step.number ? 'bg-blue-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">

            {/* STEP 1 - Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <div>
                  <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Smith" icon={User} />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName}</p>}
                </div>
                <div>
                  <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" icon={Mail} />
                  {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                </div>
                <div>
                  <Input label="Phone Number" type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" icon={Phone} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                </div>
              </div>
            )}

            {/* STEP 2 - Visit Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Visit Details</h2>
                <div>
                  <Input label="Company" name="company" value={formData.company} onChange={handleChange} placeholder="Company name" icon={Building} />
                  {errors.company && <p className="text-xs text-red-500 mt-1 font-medium">{errors.company}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {purposeOptions.map((purpose) => (
                      <button key={purpose} type="button"
                        onClick={() => { setFormData({ ...formData, purpose }); setErrors({...errors, purpose: null}); }}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.purpose === purpose ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        {purpose}
                      </button>
                    ))}
                  </div>
                  {errors.purpose && <p className="text-xs text-red-500 mt-1 font-medium">{errors.purpose}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host Employee <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className={formData.host ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.host || (loadingEmployees ? 'Loading employees...' : 'Select host employee')}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {loadingEmployees ? (
                          <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                        ) : employees.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">No employees found</div>
                        ) : (
                          employees.map((emp) => (
                            <button
                              key={emp.email}
                              type="button"
                              onClick={() => handleSelectEmployee(emp)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 transition-colors text-left ${
                                formData.hostEmail === emp.email ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                                {emp.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{emp.fullName}</p>
                                <p className="text-xs text-gray-500">{emp.email}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {errors.host && <p className="text-xs text-red-500 mt-1 font-medium">{errors.host}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} icon={Calendar} min={getLocalToday()} max={getMaxDate()} />
                    {errors.date && <p className="text-xs text-red-500 mt-1 font-medium">{errors.date}</p>}
                  </div>
                  <div>
                    <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} icon={Clock} />
                    {errors.time && <p className="text-xs text-red-500 mt-1 font-medium">{errors.time}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 - ID & Photo Upload */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">ID Verification & Photo</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Type <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {idTypes.map((type) => (
                      <button key={type} type="button"
                        onClick={() => { setFormData({ ...formData, idType: type }); setErrors({...errors, idType: null}); }}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.idType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                  {errors.idType && <p className="text-xs text-red-500 mt-1 font-medium">{errors.idType}</p>}
                </div>

                <div>
                  <Input label="ID Number" name="idNumber" value={formData.idNumber} onChange={handleChange} icon={CreditCard} />
                  {errors.idNumber && <p className="text-xs text-red-500 mt-1 font-medium">{errors.idNumber}</p>}
                </div>

                {/* FILE UPLOAD ZONE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Photo <span className="text-red-500">*</span></label>
                  
                  {!formData.photo ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-56 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors group relative cursor-pointer" onClick={() => fileInputRef.current.click()}>
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handlePhotoUpload} 
                      />
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-7 h-7 text-blue-600" />
                      </div>
                      <p className="font-semibold text-gray-700">Click to Upload Photo</p>
                      <p className="text-xs text-gray-500 mt-1">JPG or PNG (max 5MB)</p>
                    </div>
                  ) : (
                    <div className="relative inline-block border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <img src={formData.photo} alt="Visitor Preview" className="rounded-lg w-full max-w-sm h-auto object-contain shadow-sm" />
                      <button onClick={retakePhoto} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md border-2 border-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {errors.photo && <p className="text-xs text-red-500 mt-1 font-medium">{errors.photo}</p>}
                </div>
              </div>
            )}

            {/* STEP 4 - Review */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Full Name', value: formData.fullName },
                    { label: 'Email', value: formData.email },
                    { label: 'Phone', value: formData.phone },
                    { label: 'Company', value: formData.company },
                    { label: 'Purpose', value: formData.purpose },
                    { label: 'Host Employee', value: formData.host },
                    { label: 'Date', value: formData.date },
                    { label: 'Time', value: formData.time },
                    { label: 'ID Type', value: formData.idType },
                    { label: 'ID Number', value: formData.idNumber },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium">{label}</p>
                      <p className="text-gray-900 font-semibold mt-0.5">{value || '—'}</p>
                    </div>
                  ))}
                </div>
                {formData.photo && (
                  <div className="mt-4 bg-gray-50 p-3 rounded-lg inline-block">
                    <p className="text-xs text-gray-500 font-medium mb-2">Photo</p>
                    <img src={formData.photo} alt="Visitor" className="w-32 h-32 rounded-lg object-cover shadow-sm" />
                  </div>
                )}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> This visitor will be registered as <strong>Approved</strong>.
                  </p>
                  <p className="text-xs text-blue-600 mt-1 pl-6">
                    Face will be enrolled in AI system for automatic recognition upon arrival.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1} icon={ArrowLeft}>
                Back
              </Button>
              
              {currentStep < 4 ? (
                // ✅ Next button is ALWAYS clickable, but triggers validation errors instead of advancing
                <Button onClick={handleNext} icon={ArrowRight} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmitRequest} disabled={submitting} icon={Send} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {submitting ? 'Registering...' : 'Complete Registration'}
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterVisitor;