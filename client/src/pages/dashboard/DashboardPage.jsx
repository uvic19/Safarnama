import TripCard from '../../components/trip/TripCard';

export default function DashboardPage() {
  const mockTrips = [
    {
      id: 'trip-1',
      name: 'Goa 2026',
      destination: 'Goa, India',
      startDate: '12 May',
      endDate: '16 May',
      membersCount: 4,
      status: 'Ongoing'
    },
    {
      id: 'trip-2',
      name: 'Matheran Trek',
      destination: 'Matheran',
      startDate: '20 Jun',
      endDate: '22 Jun',
      membersCount: 8,
      status: 'Planning'
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto animate-fade-up">
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
        <p className="text-zinc-500 font-body font-light">Here are your recent trips.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockTrips.map(trip => (
          <TripCard key={trip.id} {...trip} />
        ))}
        
        {/* Create New Trip Card placeholder */}
        <button className="h-full min-h-[180px] rounded-3xl bg-white/[0.02] border border-dashed border-white/10 hover:border-white/30 transition-all duration-300 group flex flex-col items-center justify-center text-zinc-500 hover:text-white">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-medium text-sm">Create New Trip</span>
        </button>
      </div>
    </div>
  );
}
