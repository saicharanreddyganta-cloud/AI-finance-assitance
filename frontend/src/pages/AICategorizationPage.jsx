import React, { useState } from 'react';
import { Sparkles, BrainCircuit, ArrowRight, CheckCircle2, Sliders, ShieldCheck, Tag, Zap } from 'lucide-react';
import api from '../services/api';

export const AICategorizationPage = () => {
  const [description, setDescription] = useState('Uber ₹430');
  const [amount, setAmount] = useState('430');
  const [merchant, setMerchant] = useState('Uber');
  const [prediction, setPrediction] = useState({
    category: 'Transport',
    subcategory: 'Ride Sharing',
    confidence: 0.98,
    detected_merchant: 'Uber',
    detected_keywords: ['ride', 'cab', 'transport'],
    amount_pattern: 'Matches standard city cab / airport commute pattern (₹200 - ₹1,000)',
    model_name: 'Random Forest (Scikit-Learn) + TF-IDF Vectorizer'
  });
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    { text: 'Uber ₹430', amount: 430, merchant: 'Uber' },
    { text: 'Swiggy Gourmet Biryani Delivery', amount: 650, merchant: 'Swiggy' },
    { text: 'BigBasket Monthly Grocery Provisions', amount: 3850, merchant: 'BigBasket' },
    { text: 'Netflix Premium 4K UHD Plan', amount: 649, merchant: 'Netflix' },
    { text: 'BESCOM Domestic Electricity Power Bill', amount: 1450, merchant: 'BESCOM' },
    { text: 'Apollo Pharmacy Health Supplements Tablets', amount: 890, merchant: 'Apollo Pharmacy' },
    { text: 'Zerodha Broking Stock SIP Investment', amount: 10000, merchant: 'Zerodha' },
    { text: 'Shell Petrol Station Fuel Refill', amount: 2150, merchant: 'Shell' }
  ];

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/categorize', {
        description,
        amount: parseFloat(amount) || 0,
        merchant: merchant || undefined
      });
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setDescription(sample.text);
    setAmount(sample.amount.toString());
    setMerchant(sample.merchant);
    // Trigger prediction immediately
    setTimeout(() => {
      api.post('/ai/categorize', {
        description: sample.text,
        amount: sample.amount,
        merchant: sample.merchant
      }).then((res) => setPrediction(res.data));
    }, 50);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
          <BrainCircuit className="w-3.5 h-3.5 text-brand-600" />
          <span>Scikit-Learn ML Classification Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Transaction Categorization & NLP
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Real-time supervised machine learning pipeline trained to predict transaction categories, subcategories, and spending heuristics.
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form and Samples */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              <span>Interactive Model Tester</span>
            </h2>

            <form onSubmit={handlePredict} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Transaction Description / Narration
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Uber ₹430, Swiggy food delivery, Decathlon shoes..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="430"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Optional Merchant Name
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Uber"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Classification Model</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Benchmark Test Prompts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Benchmark Test Cases (Click to Test)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => loadSample(s)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 transition-colors text-left"
                >
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Model Prediction & Heuristic Explainability */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Model Output</span>
                  <h3 className="font-extrabold text-lg text-slate-900">Classification Results</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{(prediction.confidence * 100).toFixed(0)}% Confidence</span>
                </div>
              </div>

              {/* Main Classification Result Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">Predicted Category</span>
                  <p className="text-2xl font-extrabold text-brand-600 mt-1">{prediction.category}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">Predicted Subcategory</span>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-1">{prediction.subcategory}</p>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="mb-6 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Classification Confidence Metric</span>
                  <span className="font-mono text-brand-600">{(prediction.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, prediction.confidence * 100)}%` }}
                  />
                </div>
              </div>

              {/* AI Explainability Breakdown */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Model Decision Explainability
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                    <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0">
                      Detected Merchant:
                    </span>
                    <span className="font-bold text-slate-800 text-right">
                      {prediction.detected_merchant}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                    <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0">
                      Extracted Keywords:
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {prediction.detected_keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-brand-100 text-brand-800 font-mono rounded text-[11px] font-semibold">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                    <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0">
                      Amount Pattern:
                    </span>
                    <span className="font-medium text-slate-700 text-right">
                      {prediction.amount_pattern}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Pipeline: <strong>{prediction.model_name}</strong></span>
              <span className="font-mono text-emerald-600 font-semibold">Inference: &lt; 8ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
