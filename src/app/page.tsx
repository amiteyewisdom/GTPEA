import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } = await supabase.auth.getUser();
  
  if (!user) return <div>Not logged in. <a href="/login">Login</a></div>;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (error) return <div>Supabase Error: {error.message} <br/> User ID: {user.id}</div>;
  if (!profile) return <div>No profile found for user ID: {user.id}</div>;
  
  return (
    <div style={{padding: 40, fontSize: 18}}>
      <h1>Debug Info</h1>
      <p><b>Name:</b> {profile.full_name}</p>
      <p><b>User ID:</b> {user.id}</p>
      <p><b>Role from DB:</b> "{profile.role}"</p>
      <p><b>Role length:</b> {profile.role.length} characters</p>
      <br/>
      <a href="/dashboard">Continue to Dashboard</a>
    </div>
  );
}
