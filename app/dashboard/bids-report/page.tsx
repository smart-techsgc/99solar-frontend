'use client';

import { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Card } from '@mui/material';
import { applyCommission } from '@/utils/commission';
import { toLocalDateString } from '@/utils/date';
import { BidData, SavedReport } from '@/types/types';
import { FileUploader } from '@/app/_components/report/FileUploader';
import { ResultsPreview } from '@/app/_components/report/ResultsPreview';
import { ReportHistory } from '@/app/_components/report/ReportHistory';
import { SnackbarAlert } from '@/app/_components/report/SnackbarAlert';

export default function BidReportGenerator() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [results, setResults] = useState<BidData[]>([]);
  const [commissionApplied, setCommissionApplied] = useState(false);
  const [historyDate, setHistoryDate] = useState<string>(toLocalDateString());
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [fileCommissions, setFileCommissions] = useState<Record<string, string>>({});

  const parseCommission = (value?: string) => {
    const parsed = parseFloat(value ?? '');
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getCommissionForFile = (fileName: string) => parseCommission(fileCommissions[fileName]);

  const handleCommissionChange = (fileName: string, value: string) => {
    setFileCommissions((prev) => ({ ...prev, [fileName]: value }));
    setCommissionApplied(false);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') =>
    setSnackbar({ open: true, message, severity });

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setFileCommissions((prev) => {
        const next = { ...prev };
        newFiles.forEach((file) => {
          if (next[file.name] == null) next[file.name] = '4';
        });
        return next;
      });
      setCommissionApplied(false);
    }
  };

  // ✅ Parse Excel
  const parseExcel = useCallback(async (file: File): Promise<BidData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: 1,
          });

          // ✅ Extract code from cell H2 (Row 2, Column H)
          const h2Cell = worksheet['H2'];
          const extractedCode = h2Cell ? String(h2Cell.v).trim() : 'N/A';

          const parsedData: BidData[] = jsonData.map((row) => ({
            listingId: String(row[0] || ''),
            oem: String(row[1] || ''),
            sku: String(row[2] || ''),
            description: String(row[3] || ''),
            disposition: String(row[4] || ''),
            quantity: Number(row[5]) || 0,
            unitPrice: row[6] == null || isNaN(Number(row[6])) ? null : Number(row[6]),
            originalUnitPrice: row[6] == null || isNaN(Number(row[6])) ? null : Number(row[6]),
            fileName: file.name,
            commissionAmount: 0,
            customerCode: extractedCode,
          }));

          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // ✅ Apply Commission
  const handleApplyCommission = useCallback(() => {
    setResults((prevResults) =>
      prevResults.map((item) => {
        const commissionAmount = getCommissionForFile(item.fileName);
        return {
          ...item,
          unitPrice: applyCommission(item.originalUnitPrice ?? 0, commissionAmount),
          commissionAmount,
        };
      })
    );
    setCommissionApplied(true);
    const summary = Object.entries(fileCommissions)
      .filter(([name]) => results.some((item) => item.fileName === name))
      .map(([name, amount]) => `${name}: $${parseCommission(amount).toFixed(2)}`)
      .join(', ');
    showSnackbar(
      summary ? `Commission applied (${summary})` : 'Commission applied',
      'success'
    );
  }, [fileCommissions, results]);

  // ✅ Process uploaded files
  const processFiles = async () => {
    if (files.length === 0) {
      showSnackbar('Please select at least one file', 'warning');
      return;
    }

    setProcessing(true);
    try {
      const allData = await Promise.all(files.map(parseExcel));
      const combinedData = allData.flat();

      const aggregated = combinedData.reduce((acc: Record<string, BidData>, item) => {
        const existing = acc[item.listingId];
        if (!existing || (item.unitPrice ?? 0) > (existing.unitPrice ?? 0)) {
          acc[item.listingId] = item;
        }
        return acc;
      }, {});

      const uniqueListings = Array.from(new Set(combinedData.map((i) => i.listingId)));
      const finalResults = uniqueListings.map(
        (id) =>
          aggregated[id] || {
            listingId: id,
            oem: '',
            sku: '',
            description: '',
            disposition: '',
            quantity: 0,
            unitPrice: null,
            originalUnitPrice: null,
            commissionAmount: 0,
            fileName: '',
            customerCode: 'N/A',
          }
      );

      setResults(finalResults);
      setCommissionApplied(false);
      showSnackbar(`Processed ${files.length} files successfully.`, 'success');
    } catch (error) {
      console.error('Processing error:', error);
      showSnackbar('Failed to process files. Check file formats.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Generate downloadable Excel
  const generateReport = () => {
    if (results.length === 0) {
      showSnackbar('No data to generate report', 'warning');
      return;
    }

    try {
      // Columns A-G + H=Code to match source file layout
      const reportData = results.map((item) => ({
        'Listing Id': item.listingId,       // A
        OEM: item.oem,                       // B
        SKU: item.sku,                       // C
        Description: item.description,      // D
        Disposition: item.disposition,       // E
        Quantity: item.quantity,             // F
        Unit_Offer_Price:                    // G
          commissionApplied && item.originalUnitPrice != null
            ? applyCommission(item.originalUnitPrice, item.commissionAmount ?? getCommissionForFile(item.fileName))
            : item.originalUnitPrice,
        Code: item.customerCode || 'N/A',   // H
        'Sales Customer': item.fileName || 'N/A', // I
      }));

      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Highest Bids');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      saveAs(blob, `Highest_Bids_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Report generation error:', error);
      showSnackbar('Failed to generate report', 'error');
    }
  };

  // ✅ Save Report to backend
  const saveReport = async () => {
    if (results.length === 0) {
      showSnackbar('No data to save', 'warning');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_date: historyDate || toLocalDateString(),
          report_data: results,
        }),
      });

      if (!response.ok) throw new Error('Failed to save report');
      showSnackbar('Report saved successfully!', 'success');
      await loadReportsFromBackend(); // reload reports list
    } catch (error) {
      console.error('Save error:', error);
      showSnackbar('Failed to save report', 'error');
    }
  };

  // ✅ Load Reports
  const loadReportsFromBackend = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/reports/${historyDate}`);
      if (!response.ok) throw new Error('Failed to load reports');
      const data = await response.json();
      setSavedReports(data);
    } catch (error) {
      console.error('Load error:', error);
      showSnackbar('Failed to load reports', 'error');
    } finally {
      setLoadingHistory(false);
    }
  }, [historyDate]);

  useEffect(() => {
    if (historyDate) loadReportsFromBackend();
  }, [historyDate, loadReportsFromBackend]);

  // ✅ JSX
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bid Report Generator</h1>

      <Card className="p-6 mb-6 shadow-lg">
        <FileUploader
          files={files}
          processing={processing}
          onFileChange={handleFileChange}
          onClearFiles={() => {
            setFiles([]);
            setFileCommissions({});
            setCommissionApplied(false);
          }}
          onProcessFiles={processFiles}
          fileCommissions={fileCommissions}
          onCommissionChange={handleCommissionChange}
        />
      </Card>

      {results.length > 0 && (
        <ResultsPreview
          results={results}
          commissionApplied={commissionApplied}
          fileCommissions={fileCommissions}
          onCommissionChange={handleCommissionChange}
          getCommissionForFile={getCommissionForFile}
          onApplyCommission={handleApplyCommission}
          onSaveReport={saveReport}
          onGenerateReport={generateReport}
          processing={processing}
        />
      )}

      <ReportHistory
        historyDate={historyDate}
        savedReports={savedReports}
        loadingHistory={loadingHistory}
        onDateChange={setHistoryDate}
        onRefresh={loadReportsFromBackend}
        onLoadReport={async (report) => {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${apiUrl}/api/reports/by-id/${report.id}`);
            if (!res.ok) throw new Error('Failed to load report');
            const fullReport = await res.json();
            setResults(Array.isArray(fullReport.report_data) ? fullReport.report_data : []);
            setFileCommissions((prev) => {
              const next = { ...prev };
              (fullReport.report_data || []).forEach((item: BidData) => {
                if (item.fileName && next[item.fileName] == null) {
                  next[item.fileName] = String(item.commissionAmount ?? 4);
                }
              });
              return next;
            });
          } catch {
            showSnackbar('Failed to load report', 'error');
          }
        }}
        onDelete={async (id) => {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${apiUrl}/api/reports/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            showSnackbar('Report deleted successfully', 'success');
            await loadReportsFromBackend();
          } catch {
            showSnackbar('Failed to delete report', 'error');
          }
        }}
        onLoadAll={async (reports) => {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const fullReports = await Promise.all(
              reports.map(async (report) => {
                const res = await fetch(`${apiUrl}/api/reports/by-id/${report.id}`);
                if (!res.ok) throw new Error('Failed to load report');
                return res.json();
              })
            );
            setResults(
              fullReports.flatMap((r) => (Array.isArray(r.report_data) ? r.report_data : []))
            );
          } catch {
            showSnackbar('Failed to load reports', 'error');
          }
        }}
      />

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
}
