import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import {
  User, Mail, Phone, Building, Calendar, Clock,
  Camera, CheckCircle, ArrowLeft, ArrowRight,
  CreditCard, X, ChevronDown, AlertCircle
} from 'lucide-react';

const RegisterVisitor = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', company: '',
    purpose: '', otherPurpose: '',
    host: '', hostEmail: '',
    date: '', time: '',
    idType: '', idNumber: '', photo: null
  });
  const [stepError, setStepError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Employee dropdown
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Visit Details', icon: Building },
    { number: 3, title: 'ID & Photo',    icon: CreditCard },
    { number: 4, title: 'Review',        icon: CheckCircle }
  ];

  const purposeOptions = ['Business Meeting', 'Interview', 'Client Visit', 'Delivery', 'Maintenance', 'Other'];
  const idTypes = ['Driver License', 'Passport', 'Government ID', 'Employee ID', 'Other'];

  // Today's date as YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split('T')[0];
  // Current time as HH:MM for min attribute
  const nowTime = `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`;

  useEffect(() => {
    setLoadingEmployees(true);
    fetch('http://localhost:5260/api/auth/employees')
      .then(r => r.ok ? r.json() : [])
      .then(data => setEmployees(data))
      .catch(() => {})
      .finally(() => setLoadingEmployees(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStepError('');
  };

  const handleSelectEmployee = (emp) => {
    setFormData(prev => ({ ...prev, host: emp.fullName, hostEmail: emp.email }));
    setDropdownOpen(false);
    setStepError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // ── Inline validation per step ──
  const validateAndNext = () => {
    if (currentStep === 1) {
      if (!formData.fullName.trim())
        return setStepError('Full name is required.');
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        return setStepError('Enter a valid email address.');
      const digits = formData.phone.replace(/\D/g, '');
      if (!formData.phone.trim() || digits.length < 7 || digits.length > 15)
        return setStepError('Enter a valid phone number (7–15 digits).');
    }

    if (currentStep === 2) {
      if (!formData.company.trim())
        return setStepError('Company name is required.');
      if (!formData.purpose)
        return setStepError('Please select a purpose of visit.');
      if (formData.purpose === 'Other' && !formData.otherPurpose.trim())
        return setStepError('Please describe the purpose of visit.');
      if (!formData.host)
        return setStepError('Please select a host employee.');
      if (!formData.date)
        return setStepError('Please select a visit date.');
      if (formData.date < today)
        return setStepError('Visit date cannot be in the past.');
      if (!formData.time)
        return setStepError('Please select a visit time.');
      if (formData.date === today && formData.time < nowTime)
        return setStepError('Visit time cannot be in the past for today.');
    }

    if (currentStep === 3) {
      if (!formData.idType)
        return setStepError('Please select an ID type.');
      if (!formData.idNumber.trim())
        return setStepError('ID number is required.');
    }

    setStepError('');
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    setStepError('');
    setCurrentStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        purpose: formData.purpose === 'Other' ? formData.otherPurpose : formData.purpose,
        registeredBy: 'Admin',
      };
      const res = await fetch('http://localhost:5260/api/visitors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Visitor registered successfully!');
        setCurrentStep(1);
        setFormData({ fullName:'', email:'', phone:'', company:'', purpose:'', otherPurpose:'', host:'', hostEmail:'', date:'', time:'', idType:'', idNumber:'', photo: null });
      } else {
        alert('Failed to register visitor.');
      }
    } catch {
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
          <Header title="Visitor Registration" subtitle="Register a new visitor to the premises" />

          {/* Progress Steps */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentStep >= step.number ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm mt-2 ${currentStep >= step.number ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 transition-all ${currentStep > step.number ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border">

            {/* Error Banner */}
            {stepError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {stepError}
              </div>
            )}

            {/* ── STEP 1 ── */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Smith" icon={User} required />
                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" icon={Mail} required />
                <div>
                  <Input label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" icon={Phone} required />
                  <p className="text-xs text-gray-400 mt-1 ml-1">7–15 digits. Can include +, spaces, dashes.</p>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Visit Details</h2>
                <Input label="Company" name="company" value={formData.company} onChange={handleChange} placeholder="Company name" icon={Building} required />

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {purposeOptions.map(p => (
                      <button key={p} type="button"
                        onClick={() => { setFormData(prev => ({ ...prev, purpose: p })); setStepError(''); }}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.purpose === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  {/* Other free-text field */}
                  {formData.purpose === 'Other' && (
                    <textarea
                      name="otherPurpose"
                      value={formData.otherPurpose}
                      onChange={handleChange}
                      placeholder="Please describe the reason for the visit..."
                      rows={3}
                      className="mt-3 w-full px-4 py-2.5 border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  )}
                </div>

                {/* Host Employee Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host Employee <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className={formData.host ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.host || (loadingEmployees ? 'Loading...' : 'Select host employee')}
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
                        ) : employees.map(emp => (
                          <button key={emp.email} type="button" onClick={() => handleSelectEmployee(emp)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 transition-colors text-left ${formData.hostEmail === emp.email ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'}`}>
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                              {emp.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{emp.fullName}</p>
                              <p className="text-xs text-gray-500">{emp.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date — blocked to today or future only */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} icon={Calendar} required min={today} />
                    <p className="text-xs text-gray-400 mt-1 ml-1">Cannot be a past date.</p>
                  </div>
                  <div>
                    {/* Time — if today selected, block past times */}
                    <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} icon={Clock} required min={formData.date === today ? nowTime : undefined} />
                    {formData.date === today && <p className="text-xs text-gray-400 mt-1 ml-1">Cannot be a past time for today.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">ID Verification & Photo</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Type <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {idTypes.map(type => (
                      <button key={type} type="button" onClick={() => setFormData(prev => ({ ...prev, idType: type }))}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.idType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="ID Number" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="Enter ID number" icon={CreditCard} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Photo</label>
                  {!formData.photo ? (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer block hover:border-blue-400 hover:bg-blue-50 transition-all group">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Camera className="w-7 h-7 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Upload Photo from Device</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    </label>
                  ) : (
                    <div className="relative inline-block">
                      <img src={formData.photo} alt="Preview" className="rounded-lg w-full max-w-xs shadow-md border" />
                      <button onClick={() => setFormData(prev => ({ ...prev, photo: null }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 4 — Review ── */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Information</h2>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  {formData.photo
                    ? <img src={formData.photo} className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" alt="Visitor" />
                    : <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-8 h-8 text-blue-600" /></div>}
                  <div>
                    <h3 className="font-semibold text-gray-900">{formData.fullName}</h3>
                    <p className="text-sm text-gray-500">{formData.company}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Email',     value: formData.email },
                    { label: 'Phone',     value: formData.phone },
                    { label: 'Purpose',   value: formData.purpose === 'Other' ? formData.otherPurpose : formData.purpose },
                    { label: 'Host',      value: formData.host },
                    { label: 'Date',      value: formData.date },
                    { label: 'Time',      value: formData.time },
                    { label: 'ID Type',   value: formData.idType },
                    { label: 'ID Number', value: formData.idNumber },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium">{label}</p>
                      <p className="text-gray-900 font-semibold mt-0.5">{value || '—'}</p>
                    </div>
                  ))}
                </div>
                {formData.photo && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 font-medium mb-2">Photo</p>
                    <img src={formData.photo} alt="Visitor" className="w-24 h-24 rounded-lg object-cover border" />
                  </div>
                )}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">✓ This visitor will be registered as <strong>Approved</strong> by Admin.</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1} icon={ArrowLeft}>Back</Button>
              {currentStep < 4
                ? <Button onClick={validateAndNext} icon={ArrowRight}>Continue</Button>
                : <Button variant="success" onClick={handleSubmit} disabled={submitting} icon={CheckCircle}>
                    {submitting ? 'Registering...' : 'Complete Registration'}
                  </Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterVisitor;