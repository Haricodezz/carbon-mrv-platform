'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DownloadIcon, FileTextIcon, Maximize2Icon, XIcon, CheckCircleIcon } from 'lucide-react';
import { apiClient, parseApiError } from '@/lib/api';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  documentTitle: string;
  projectId?: string;
  userId?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  documentType,
  documentTitle,
  projectId,
  userId
}: DocumentPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Construct URL based on context
  const getDownloadUrl = () => {
    if (projectId) return `/api/reports/project/${projectId}/${documentType}`;
    if (userId) return `/api/reports/user/${documentType}`;
    return null;
  };

  const handleDownload = async () => {
    const url = getDownloadUrl();
    if (!url) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const response = await apiClient.get(url, {
        responseType: 'blob', // Important for PDF
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${documentTitle.replace(/\s+/g, '_')}_${documentType}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      setError("Failed to securely generate the institutional report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    const url = getDownloadUrl();
    if (!url) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      // Clean up object URL after a delay (if needed) or let the browser handle it
    } catch (err: any) {
      setError("Failed to securely generate the institutional report.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`transition-all duration-300 ${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-2xl'}`}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileTextIcon size={24} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">{documentTitle}</DialogTitle>
                <DialogDescription className="text-sm font-medium text-emerald-700 flex items-center mt-1">
                  <CheckCircleIcon size={14} className="mr-1" />
                  Blockchain-Verifiable Institutional Report
                </DialogDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize2Icon size={18} className="text-slate-500" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 mt-4 min-h-[300px]">
           <FileTextIcon size={64} className="text-slate-300 mb-4" />
           <h3 className="text-lg font-semibold text-slate-700 mb-2">Secure Report Generation</h3>
           <p className="text-center text-slate-500 text-sm max-w-md mb-6">
             This document is generated on-demand using institutional-grade templates. It includes tamper-evident metrics, immutable transaction hashes, and registry signatures.
           </p>
           
           {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
           
           <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button 
                onClick={handlePreview} 
                disabled={isGenerating}
                variant="outline" 
                className="w-full sm:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                {isGenerating ? 'Generating...' : 'Preview Document'}
              </Button>
              <Button 
                onClick={handleDownload} 
                disabled={isGenerating}
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
