import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Clock,
  Camera,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  X
} from 'lucide-react';

const RegisterVisitor = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
    host: '',
    date: '',
    time: '',
    idType: '',
    idNumber: '',
    photo: null
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Visit Details', icon: Building },
    { number: 3, title: 'ID & Photo', icon: CreditCard },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  const purposeOptions = ['Business Meeting', 'Interview', 'Client Visit', 'Delivery', 'Maintenance', 'Other'];
  const idTypes = ['Driver License', 'Passport', 'Government ID', 'Employee ID', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- NEW: Handle Device File Upload ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5260/api/visitors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, registeredBy: "Admin" }),
      });

      if (response.ok) {
        alert('Visitor registered successfully!');
        setCurrentStep(1); 
        setFormData({ fullName: '', email: '', phone: '', company: '', purpose: '', host: '', date: '', time: '', idType: '', idNumber: '', photo: null });
      }
    } catch (error) {
      alert('Error connecting to backend!');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header title="Visitor Registration" subtitle="Register a new visitor to the premises" />

          {/* Progress Steps */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= step.number ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm mt-2 ${currentStep >= step.number ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>{step.title}</span>
                  </div>
                  {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-blue-500' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Smith" icon={User} required />
                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" icon={Mail} required />
                <Input label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" icon={Phone} required />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Visit Details</h2>
                <Input label="Company" name="company" value={formData.company} onChange={handleChange} placeholder="Company name" icon={Building} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {purposeOptions.map((purpose) => (
                      <button key={purpose} type="button" onClick={() => setFormData({ ...formData, purpose })} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.purpose === purpose ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>{purpose}</button>
                    ))}
                  </div>
                </div>
                <Input label="Host Name" name="host" value={formData.host} onChange={handleChange} placeholder="Name of person you're visiting" icon={User} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} icon={Calendar} required />
                  <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} icon={Clock} required />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">ID Verification & Photo</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {idTypes.map((type) => (
                        <button key={type} type="button" onClick={() => setFormData({ ...formData, idType: type })} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.idType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>{type}</button>
                      ))}
                    </div>
                  </div>
                  <Input label="ID Number" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="Enter ID number" icon={CreditCard} required />
                  
                  {/* DEVICE UPLOAD UI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Photo</label>
                    {!formData.photo ? (
                      <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer block group">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Camera className="w-8 h-8 text-blue-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Upload Photo from Device</p>
                          <p className="text-xs text-gray-500">Click to browse gallery or capture via camera</p>
                        </div>
                      </label>
                    ) : (
                      <div className="relative inline-block">
                        <img src={formData.photo} alt="Preview" className="rounded-lg w-full max-w-xs shadow-md border border-gray-200" />
                        <button onClick={() => setFormData({ ...formData, photo: null })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Information</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {formData.photo ? <img src={formData.photo} className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" alt="Visitor" /> : <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-8 h-8 text-blue-600" /></div>}
                    <div>
                      <h3 className="font-semibold text-gray-900">{formData.fullName || 'N/A'}</h3>
                      <p className="text-sm text-gray-600">{formData.company || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-600 mb-1">Email</p><p className="font-medium text-gray-900">{formData.email || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-600 mb-1">Host</p><p className="font-medium text-gray-900">{formData.host || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-600 mb-1">Phone</p><p className="font-medium text-gray-900">{formData.phone || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-600 mb-1">ID Type</p><p className="font-medium text-gray-900">{formData.idType || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-600 mb-1">Purpose</p><p className="font-medium text-gray-900">{formData.purpose || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-600 mb-1">ID Number</p><p className="font-medium text-gray-900">{formData.idNumber || 'N/A'}</p></div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1} icon={ArrowLeft}>Back</Button>
              {currentStep < 4 ? <Button onClick={handleNext} icon={ArrowRight}>Continue</Button> : <Button variant="success" onClick={handleSubmit} icon={CheckCircle}>Complete Registration</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterVisitor;