import React, { useState } from 'react';
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import { 
  User, Mail, Phone, Building, Calendar, Clock, 
  Camera, CheckCircle, ArrowLeft, ArrowRight, CreditCard, 
  Send, X 
} from 'lucide-react';

const SecurityRegisterVisitor = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', company: '',
    purpose: '', host: '', // Simple text field restored
    date: '', time: '', idType: '', idNumber: '', photo: null
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
    try {
      const response = await fetch('http://localhost:5260/api/visitors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, registeredBy: "Security" }),
      });

      if (response.ok) {
        alert('Visitor registration successful!');
        setCurrentStep(1);
        setFormData({ fullName: '', email: '', phone: '', company: '', purpose: '', host: '', date: '', time: '', idType: '', idNumber: '', photo: null });
      } else {
        alert('Failed to register visitor.');
      }
    } catch (error) {
      alert('Error connecting to backend!');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header title="Register Visitor" subtitle="Register a new visitor" />

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mt-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {purposeOptions.map((purpose) => (
                      <button key={purpose} type="button" onClick={() => setFormData({ ...formData, purpose })} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.purpose === purpose ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>{purpose}</button>
                    ))}
                  </div>
                </div>

                {/* SIMPLE TEXT INPUT FOR HOST */}
                <Input label="Host Name" name="host" value={formData.host} onChange={handleChange} placeholder="Name of person visiting" icon={User} required />

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} icon={Calendar} required />
                  <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} icon={Clock} required />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">ID Verification & Photo</h2>
                <Input label="ID Number" name="idNumber" value={formData.idNumber} onChange={handleChange} icon={CreditCard} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Photo</label>
                  {!formData.photo ? (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer block">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      <Camera className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Upload Photo</p>
                    </label>
                  ) : (
                    <div className="relative inline-block">
                      <img src={formData.photo} alt="Preview" className="rounded-lg w-full max-w-xs shadow-md border" />
                      <button onClick={() => setFormData({ ...formData, photo: null })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Information</h2>
                <p className="text-gray-700">Please confirm the visitor details for <strong>{formData.fullName}</strong> before completing registration.</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1} icon={ArrowLeft}>Back</Button>
              {currentStep < 4 ? <Button onClick={handleNext} icon={ArrowRight}>Continue</Button> : <Button variant="success" onClick={handleSubmitRequest} icon={Send}>Complete</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityRegisterVisitor;