'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function DataImportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Data Imports</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Import and manage bulk data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">Import Data</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-brand-card-border rounded-lg p-8 text-center hover:border-brand-accent transition-all cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-brand-text-secondary" />
              <p className="text-brand-text font-medium mb-2">Drop files here or click to upload</p>
              <p className="text-brand-text-secondary text-sm">Supports CSV, Excel files</p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-accent text-brand-primary rounded-lg font-medium hover:bg-brand-accent/90 transition-all">
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-card-bg border border-brand-card-border rounded-lg text-brand-text hover:bg-brand-hover transition-all">
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">Import History</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-card-bg">
              <CheckCircle className="w-5 h-5 text-brand-success" />
              <div className="flex-1">
                <p className="text-brand-text font-medium text-sm">No imports yet</p>
                <p className="text-brand-text-secondary text-xs">-</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-brand-text mb-4">Import Guidelines</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-brand-accent mt-0.5" />
            <div>
              <p className="text-brand-text font-medium text-sm mb-1">File Format</p>
              <p className="text-brand-text-secondary text-sm">Use CSV or Excel files with proper headers</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-brand-warning mt-0.5" />
            <div>
              <p className="text-brand-text font-medium text-sm mb-1">Data Validation</p>
              <p className="text-brand-text-secondary text-sm">Ensure all required fields are filled correctly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-brand-success mt-0.5" />
            <div>
              <p className="text-brand-text font-medium text-sm mb-1">Review Before Import</p>
              <p className="text-brand-text-secondary text-sm">Always preview data before final import</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
