export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm h-96 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-64 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
