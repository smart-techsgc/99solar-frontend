'use client';

import { FileText, Upload, Mail, FileOutput } from 'lucide-react';
import { Button } from '../dashboard/components/ui/button';

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Button variant="outline" className="flex flex-col h-24">
        <FileText className="w-6 h-6 mb-2" />
        <span>Process New File</span>
      </Button>
      <Button variant="outline" className="flex flex-col h-24">
        <Upload className="w-6 h-6 mb-2" />
        <span>Submit to Verizon</span>
      </Button>
      <Button variant="outline" className="flex flex-col h-24">
        <Mail className="w-6 h-6 mb-2" />
        <span>Send Bid Invites</span>
      </Button>
      <Button variant="outline" className="flex flex-col h-24">
        <FileOutput className="w-6 h-6 mb-2" />
        <span>Generate Invoices</span>
      </Button>
    </div>
  );
}