"use client";

import React from "react";
import { Shield } from "lucide-react";

export function BoardMembersTable() {
  const [boardMembers, setBoardMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchData = async () => {
    console.log('[BoardMembersTable] fetchData called');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/board-members');
      const data = await response.json();
      console.log('[BoardMembersTable] Data received:', data);
      if (response.ok) {
        setBoardMembers(data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch board members:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    console.log('[BoardMembersTable] useEffect running');
    fetchData();
  }, []);

  const handleRemoveRole = async (employeeNo: string) => {
    try {
      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeNo, role: 'employee' }),
      });
      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to remove role');
      }
    } catch (error) {
      alert('Failed to remove role');
    }
  };

  const roleLabels: Record<string, string> = {
    'chairperson': 'Chairperson',
    'administrator': 'Administrator',
    'fund_manager': 'Fund Manager',
    'union_rep': 'Trustee',
  };

  const roleColors: Record<string, string> = {
    'chairperson': 'bg-purple-100 text-purple-700 border-purple-200',
    'administrator': 'bg-blue-100 text-blue-700 border-blue-200',
    'fund_manager': 'bg-green-100 text-green-700 border-green-200',
    'union_rep': 'bg-orange-100 text-orange-700 border-orange-200',
  };

  console.log('[BoardMembersTable] Render - members:', boardMembers.length, 'loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  if (boardMembers.length === 0) {
    return (
      <div className="text-center py-8 text-brand-text-secondary">
        No board members assigned yet. Use the Employees page to assign board roles.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-brand-card-border">
            <th className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Employee</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Employee No.</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Board Role</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Department</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {boardMembers.map((member: any) => (
            <tr key={member.id} className="border-b border-brand-card-border hover:bg-brand-hover/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent border border-brand-accent/30 flex items-center justify-center text-xs font-bold">
                    {member.first_name[0]}{member.last_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-text">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-xs text-brand-text-secondary">{member.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-brand-text-secondary font-mono">{member.employee_no}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[member.role] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {roleLabels[member.role] || member.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-brand-text-secondary">{member.department}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleRemoveRole(member.employee_no)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove Role
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
