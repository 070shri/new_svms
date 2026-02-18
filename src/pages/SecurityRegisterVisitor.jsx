import React, { useState, useEffect } from 'react';
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import { 
  User, Mail, Phone, Building, Calendar, Clock, 
  Camera, CheckCircle, ArrowLeft, ArrowRight, CreditCard, 
  Send, X, ChevronDown
} from 'lucide-react';

const SecurityRegisterVisitor = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', company: '',
    purpose: '', host: '', hostEmail: '',
    date: '', time: '', idType: '', idNumber: '', photo: null
  });

  // Employee dropdown state
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

  // Fetch employee list from backend on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await fetch('http://localhost:5260/api/auth/employees');
        if (res.ok) {
          const data = await res.json();
          setEmployees(data); // [{ fullName, email }]
        }
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // When employee is selected from dropdown, store both name and email
  const handleSelectEmployee = (emp) => {
    setFormData({ ...formData, host: emp.fullName, hostEmail: emp.email });
    setDropdownOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmitRequest = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5260/api/visitors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, registeredBy: "Security" }),
      });

      if (response.ok) {
        alert('Visitor registered! Notification sent to ' + formData.host);
        setCurrentStep(1);
        setFormData({
          fullName: '', email: '', phone: '', company: '',
          purpose: '', host: '', hostEmail: '',
          date: '', time: '', idType: '', idNumber: '', photo: null
        });
      } else {
        alert('Failed to register visitor.');
      }
    } catch (error) {
      alert('Error connecting to backend!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header title="Register Visitor" subtitle="Register a new visitor" />

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 my-6">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentStep === step.number
                    ? 'bg-green-600 text-white'
                    : currentStep > step.number
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <step.icon className="w-3.5 h-3.5" />
                  {step.title}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 w-8 rounded ${currentStep > step.number ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">

            {/* STEP 1 - Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Smith" icon={User} required />
                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" icon={Mail} required />
                <Input label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" icon={Phone} required />
              </div>
            )}

            {/* STEP 2 - Visit Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Visit Details</h2>
                <Input label="Company" name="company" value={formData.company} onChange={handleChange} placeholder="Company name" icon={Building} required />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {purposeOptions.map((purpose) => (
                      <button key={purpose} type="button"
                        onClick={() => setFormData({ ...formData, purpose })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.purpose === purpose ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        {purpose}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HOST EMPLOYEE DROPDOWN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host Employee <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
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
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-green-50 transition-colors text-left ${
                                formData.hostEmail === emp.email ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-900'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs flex-shrink-0">
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
                  {formData.host && (
                    <p className="mt-1 text-xs text-green-600">✓ Notification will be sent to {formData.host}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} icon={Calendar} required />
                  <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} icon={Clock} required />
                </div>
              </div>
            )}

            {/* STEP 3 - ID & Photo */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">ID Verification & Photo</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Type <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {idTypes.map((type) => (
                      <button key={type} type="button"
                        onClick={() => setFormData({ ...formData, idType: type })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.idType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Input label="ID Number" name="idNumber" value={formData.idNumber} onChange={handleChange} icon={CreditCard} required />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Photo</label>
                  {!formData.photo ? (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer block hover:border-green-400 transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      <Camera className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Click to Upload Photo</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                    </label>
                  ) : (
                    <div className="relative inline-block">
                      <img src={formData.photo} alt="Preview" className="rounded-lg w-full max-w-xs shadow-md border" />
                      <button onClick={() => setFormData({ ...formData, photo: null })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
                    { label: 'Host Email', value: formData.hostEmail },
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
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 font-medium mb-2">Photo</p>
                    <img src={formData.photo} alt="Visitor" className="w-24 h-24 rounded-lg object-cover border" />
                  </div>
                )}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✓ A notification will be sent to <strong>{formData.host}</strong> to approve or reject this visitor.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1} icon={ArrowLeft}>Back</Button>
              {currentStep < 4
                ? <Button onClick={handleNext} icon={ArrowRight}>Continue</Button>
                : <Button variant="success" onClick={handleSubmitRequest} disabled={submitting} icon={Send}>
                    {submitting ? 'Submitting...' : 'Submit & Notify Host'}
                  </Button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityRegisterVisitor;
