import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { tripService } from '../../services/tripService';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

import Step1Basics from '../../components/trip/create/Step1Basics';
import Step2Budget from '../../components/trip/create/Step2Budget';
import Step3Members from '../../components/trip/create/Step3Members';
import Step4Review from '../../components/trip/create/Step4Review';

export default function CreateTripPage() {
  const { user } = useAuth();
  const location = useLocation();
  const template = location.state?.template;
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: template?.name || '',
    destinations: template?.destinations?.join(', ') || '',
    start_date: null,
    end_date: null,
    mode: 'SOLO',
    base_currency: 'INR',
    total_budget: template?.estimated_budget ? String(template.estimated_budget) : '',
    budget_limits: {},
    offline_members: [''], // Array of empty strings for inputs
    template_itinerary: template?.itinerary || null
  });

  const updateData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleCreate = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const tripId = await tripService.createTrip({
        ...formData,
        destinations: formData.destinations.split(',').map(d => d.trim()).filter(Boolean)
      }, user.uid);
      
      toast.success('Trip created successfully!');
      navigate('/dashboard'); // Redirect to dashboard after creation
    } catch (error) {
      toast.error('Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-6 py-4 flex flex-col pb-16 md:pb-0">
      {/* Step Indicator */}
      <div className="mb-6 px-4 md:px-0">
        <h1 className="text-display-md text-foreground mb-4">Create New Trip</h1>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex-1">
              <div className={`h-2 rounded-full ${step >= num ? 'bg-primary' : 'bg-muted'}`} />
              <p className="text-label mt-2 text-muted-foreground">Step {num}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-0 md:p-[2px] md:rounded-2xl bg-transparent md:bg-white/[0.03] ring-0 md:ring-1 md:ring-white/[0.06] mb-6">
        <div className="md:rounded-[calc(1.5rem-2px)] bg-transparent md:bg-[#18181B] px-4 py-2 md:p-6 md:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] min-h-[320px]">
          <div key={step} className="animate-fade-up">
            {step === 1 && <Step1Basics data={formData} updateData={updateData} />}
            {step === 2 && <Step2Budget data={formData} updateData={updateData} />}
            {step === 3 && <Step3Members data={formData} updateData={updateData} />}
            {step === 4 && <Step4Review data={formData} />}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col md:flex-row justify-between gap-2 px-4 md:px-0 pb-6 md:pb-0">
        <Button variant="outline" onClick={prevStep} disabled={step === 1 || isSubmitting} className="w-full md:w-auto">
          Back
        </Button>
        
        {step < 4 ? (
          <Button onClick={nextStep} className="bg-primary text-primary-foreground font-medium w-full md:w-auto">
            Next
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={isSubmitting} className="bg-primary text-primary-foreground font-medium px-8 w-full md:w-auto">
            {isSubmitting ? 'Creating...' : 'Create Trip'}
          </Button>
        )}
      </div>
    </div>
  );
}
