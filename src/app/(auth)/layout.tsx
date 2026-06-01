export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#FBFBF9" }}>
      {children}
    </div>
  );
}
