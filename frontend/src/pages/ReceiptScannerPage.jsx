import React, { useState, useEffect } from 'react';
import {
  ScanLine,
  Upload,
  Sparkles,
  CheckCircle2,
  FileText,
  Edit2,
  Check,
  AlertCircle,
  Receipt,
  Layers,
  ArrowRight,
  Clock
} from 'lucide-react';
import api from '../services/api';

export const ReceiptScannerPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    merchant: '',
    date: '',
    amount: '',
    category: 'Food',
    payment_method: 'UPI',
    notes: ''
  });
  const [confirmSuccess, setConfirmSuccess] = useState('');

  const fetchReceipts = async () => {
    try {
      const res = await api.get('/receipts');
      setReceipts(res.data);
      if (res.data.length > 0 && !activeReceipt) {
        setActiveReceipt(res.data[0]);
        setEditFields({
          merchant: res.data[0].merchant || '',
          date: res.data[0].date || '',
          amount: res.data[0].amount || '',
          category: res.data[0].category || 'Food',
          payment_method: 'UPI',
          notes: ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setConfirmSuccess('');
    try {
      const res = await api.post('/receipts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setActiveReceipt(res.data);
      setEditFields({
        merchant: res.data.merchant || '',
        date: res.data.date || '',
        amount: res.data.amount || '',
        category: res.data.category || 'Food',
        payment_method: 'UPI',
        notes: ''
      });
      fetchReceipts();
    } catch (err) {
      console.error(err);
      alert('Failed to process receipt image');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = async (filename) => {
    // Create an empty dummy file with chosen demo filename to trigger server-side OCR simulation
    const blob = new Blob(["DEMO RECEIPT CONTENT"], { type: "text/plain" });
    const file = new File([blob], filename, { type: "image/jpeg" });
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setConfirmSuccess('');
    try {
      const res = await api.post('/receipts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setActiveReceipt(res.data);
      setEditFields({
        merchant: res.data.merchant || '',
        date: res.data.date || '',
        amount: res.data.amount || '',
        category: res.data.category || 'Food',
        payment_method: 'UPI',
        notes: ''
      });
      fetchReceipts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!activeReceipt) return;
    try {
      const res = await api.post('/receipts/confirm', {
        receipt_id: activeReceipt.id,
        merchant: editFields.merchant,
        date: editFields.date,
        amount: parseFloat(editFields.amount),
        category: editFields.category,
        payment_method: editFields.payment_method,
        notes: editFields.notes
      });
      setConfirmSuccess(`Receipt confirmed! Automatically added Transaction #${res.data.transaction_id} to your ledger.`);
      setIsEditing(false);
      fetchReceipts();
    } catch (err) {
      console.error(err);
      alert('Confirmation failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
          <ScanLine className="w-3.5 h-3.5 text-brand-600" />
          <span>Optical Character Recognition (OCR) Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Intelligent Receipt & Invoice Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Scan invoices or receipts (JPG, PNG, PDF) to automatically extract merchant, tax, line items, and convert into verified transactions.
        </p>
      </div>

      {/* Main Grid: Upload/Preview & Extraction Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Dropzone & Demo Presets */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload Box */}
          <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-slate-300 hover:border-brand-500 text-center transition-colors shadow-card">
            <input
              type="file"
              id="receipt-file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="receipt-file" className="cursor-pointer block py-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click to upload receipt image
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports JPG, PNG, PDF (Up to 10MB)
              </p>
            </label>
          </div>

          {/* Quick Demo Pre-scanned Receipts */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Click OCR Demo Samples</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">Test document scanning instantly with preset invoices:</p>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoPreset('foodmart_grocery_02jun.jpg')}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <span>🛒 Food Mart Grocery Invoice (₹660)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => handleDemoPreset('uber_airport_ride.jpg')}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <span>🚕 Uber Airport Cab Receipt (₹430)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => handleDemoPreset('apollo_pharmacy_bill.jpg')}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <span>💊 Apollo Pharmacy Medical Memo (₹890)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Past Scanned Receipts History */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Scanned Receipts Archive
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {receipts.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    setActiveReceipt(r);
                    setEditFields({
                      merchant: r.merchant || '',
                      date: r.date || '',
                      amount: r.amount || '',
                      category: r.category || 'Food',
                      payment_method: 'UPI',
                      notes: ''
                    });
                    setConfirmSuccess('');
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    activeReceipt?.id === r.id
                      ? 'bg-brand-50 border-brand-300 text-brand-900 font-bold'
                      : 'hover:bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <p className="font-semibold truncate">{r.merchant || r.filename}</p>
                    <span className="text-[10px] text-slate-400">{r.date}</span>
                  </div>
                  <span className="font-mono font-bold">₹{r.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: OCR Extracted Fields & Confirmation Form */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-card text-center text-slate-500">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="font-bold text-slate-800">Processing Document with OCR...</p>
              <p className="text-xs text-slate-400 mt-1">Extracting merchant, line items, and transaction totals</p>
            </div>
          ) : activeReceipt ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-6">
              {confirmSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{confirmSuccess}</span>
                </div>
              )}

              {/* Extraction Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">OCR Extraction</span>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {editFields.merchant || 'Parsed Document'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Cancel Edit' : 'Edit Fields'}</span>
                  </button>
                  <button
                    onClick={handleConfirmReceipt}
                    className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Create Transaction</span>
                  </button>
                </div>
              </div>

              {/* Form Fields: Read-only or Editable */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={editFields.merchant}
                    onChange={(e) => setEditFields({ ...editFields, merchant: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 disabled:bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={editFields.date}
                    onChange={(e) => setEditFields({ ...editFields, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 disabled:bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditing}
                    value={editFields.amount}
                    onChange={(e) => setEditFields({ ...editFields, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black font-mono text-brand-600 disabled:bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Predicted Category
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={editFields.category}
                    onChange={(e) => setEditFields({ ...editFields, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 disabled:bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Extracted Line Items */}
              {activeReceipt.items && activeReceipt.items.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Extracted Line Items
                  </h4>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                    {activeReceipt.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-slate-700">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{item.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    {activeReceipt.tax > 0 && (
                      <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200 font-semibold">
                        <span>Applicable GST / Taxes</span>
                        <span className="font-mono">₹{activeReceipt.tax?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Raw OCR Text Terminal */}
              {activeReceipt.raw_text && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Raw OCR Stream
                  </h4>
                  <pre className="p-3 bg-slate-900 text-slate-300 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-32">
                    {activeReceipt.raw_text}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-card text-center text-slate-400">
              <ScanLine className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-sm">No Receipt Selected</p>
              <p className="text-xs text-slate-400 mt-1">Upload a receipt or pick a demo sample to view OCR extractions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
