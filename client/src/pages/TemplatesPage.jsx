import { useState } from 'react';
import { ArrowLeft, Map, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const TEMPLATES = [
  {
    id: 't1',
    name: 'Goa Weekend Getaway',
    destinations: ['Goa'],
    duration_days: 3,
    estimated_budget: 15000,
    tags: ['Beach', 'Party', 'Relax']
  },
  {
    id: 't2',
    name: 'Manali Backpacking',
    destinations: ['Manali', 'Kasol'],
    duration_days: 5,
    estimated_budget: 8000,
    tags: ['Mountains', 'Adventure', 'Budget']
  },
  {
    id: 't3',
    name: 'Rajasthan Heritage',
    destinations: ['Jaipur', 'Udaipur', 'Jodhpur'],
    duration_days: 7,
    estimated_budget: 35000,
    tags: ['Culture', 'History', 'Luxury']
  }
];

export default function TemplatesPage() {
  const navigate = useNavigate();

  const handleUseTemplate = (template) => {
    // Navigate to create trip page and pass template data via state
    navigate('/trips/new', { state: { template } });
    toast.success(`Loaded template: ${template.name}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto animate-fade-up pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-muted-foreground hover:text-foreground md:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          Trip Templates
        </h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Start your next adventure quickly by using one of our pre-built itineraries or your saved trips.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(template => (
          <div key={template.id} className="p-[2px] rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex flex-col group">
            <div className="rounded-[calc(1.5rem-2px)] bg-card p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Map className="w-5 h-5" />
                </div>
                <div className="flex gap-1 flex-wrap justify-end max-w-[60%]">
                  {template.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-medium bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <h3 className="font-display text-lg font-bold text-foreground mb-1">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{template.destinations.join(' • ')}</p>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono">₹{template.estimated_budget.toLocaleString()}</span> · {template.duration_days} days
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleUseTemplate(template)} className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Copy className="w-4 h-4 mr-2" />
                  Use
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
