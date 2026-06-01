export default function Loading() {
  return (
    <div className="min-h-screen px-6 pt-28 pb-16 max-w-7xl mx-auto space-y-10 animate-pulse">
      <div className="space-y-5 text-center max-w-4xl mx-auto">
        <div className="h-6 w-40 mx-auto rounded-full bg-white/10" />
        <div className="h-20 md:h-28 rounded-3xl bg-gradient-to-r from-white/10 via-white/15 to-white/10 animate-shimmer" />
        <div className="h-6 w-full max-w-2xl mx-auto rounded-full bg-white/10" />
        <div className="h-6 w-5/6 mx-auto rounded-full bg-white/10" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass rounded-2xl p-5 space-y-4 border border-white/10">
            <div className="h-12 w-12 rounded-xl bg-white/10" />
            <div className="h-4 w-24 rounded-full bg-white/10" />
            <div className="h-3 w-full rounded-full bg-white/10" />
            <div className="h-3 w-5/6 rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="glass rounded-3xl p-6 space-y-4 border border-white/10">
            <div className="h-56 rounded-2xl bg-white/10" />
            <div className="h-6 w-1/2 rounded-full bg-white/10" />
            <div className="h-4 w-full rounded-full bg-white/10" />
            <div className="h-4 w-5/6 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}