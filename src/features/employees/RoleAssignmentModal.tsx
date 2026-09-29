"use client";

import React from "react";
import { X } from "lucide-react";

interface RoleAssignmentModalProps {
  onClose: () => void;
  targetEmployee?: { id: string; name: string; employee_no: string };
}

export function RoleAssignmentModal({ onClose, targetEmployee }: RoleAssignmentModalProps) {
  const [selectedRole, setSelectedRole] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const boardRoles = [
    { value: 'chairperson', label: 'Chairperson' },
    { value: 'administrator', label: 'Administrator' },
    { value: 'fund_manager', label: 'Fund Manager' },
    { value: 'union_rep', label: 'Union Representative' },
  ];

  const handleAssign = async () => {
    if (!targetEmployee || !selectedRole) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: targetEmployee.employee_no, // Use employee_no, not UUID
          role: selectedRole,
        }),
      });

      if (response.ok) {
        onClose();
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to assign role');
      }
    } catch (error) {
      console.error('Failed to assign role:', error);
      alert('Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Assign Board Role</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {targetEmployee ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {targetEmployee.name} ({targetEmployee.employee_no})
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
              <select
                value=""
                onChange={(e) => {}}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="">Choose an employee...</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="">Choose a role...</option>
              {boardRoles.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedRole || loading}
            className="px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Assigning...' : 'Assign Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
