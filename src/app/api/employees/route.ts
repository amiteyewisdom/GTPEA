// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const firstName = String(body?.first_name || "");
  const lastName = String(body?.last_name || "");
  const email = String(body?.email || "");
  const employeeNo = String(body?.employee_no || "");
  const department = String(body?.department || "");
  const position = String(body?.position || "");
  const salary = Number(body?.salary);

  if (!firstName || !lastName || !email || !employeeNo || !department || !position) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (!salary || salary <= 0) {
    return NextResponse.json({ error: "Salary must be greater than zero." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Check if employee number already exists
  const { data: existingEmployee } = await supabase
    .from("employees")
    .select("id")
    .eq("employee_no", employeeNo)
    .single();

  if (existingEmployee) {
    return NextResponse.json({ error: "Employee number already exists." }, { status: 400 });
  }

  // Create employee
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        email: email,
        employee_no: employeeNo,
        department: department,
        position: position,
        salary: salary,
        status: "active",
        date_joined: new Date().toISOString(),
      },
    ] as any)
    .select()
    .single() as any;

  if (employeeError || !employee) {
    return NextResponse.json({ error: employeeError?.message || "Failed to create employee." }, { status: 500 });
  }

  return NextResponse.json({ message: "Employee created successfully", employee });
}
