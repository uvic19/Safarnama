export default function Step4Review({ data }) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-heading-lg mb-1">Review & Create</h2>
        <p className="text-body-md text-muted-foreground">Looks good? Let's start the journey.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-5">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Trip Name</span>
          <p className="text-body-lg font-medium mt-0.5">{data.name || 'Untitled Trip'}</p>
        </div>
        
        {data.destinations && (
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Destination</span>
            <p className="text-body-lg mt-0.5">{data.destinations}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Start</span>
            <p className="text-body-md font-mono mt-0.5">{data.start_date || 'Not set'}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">End</span>
            <p className="text-body-md font-mono mt-0.5">{data.end_date || 'Not set'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Mode</span>
            <p className="text-body-md mt-0.5">
              {data.mode === 'SOLO' && 'Solo Trip'}
              {data.mode === 'GROUP_FULL' && 'Group (Full)'}
              {data.mode === 'GROUP_KAPTAN_ONLY' && 'Kaptan Only'}
            </p>
          </div>
          {data.total_budget && (
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Budget</span>
              <p className="text-body-md font-mono mt-0.5">
                {data.base_currency === 'INR' ? '₹' : '$'}{data.total_budget}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
