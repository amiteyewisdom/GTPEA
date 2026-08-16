export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-4 py-3">
        <h1 className="text-lg font-bold">GTPEA Finance</h1>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
