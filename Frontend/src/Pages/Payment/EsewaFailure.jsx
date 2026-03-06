import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RotateCw } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const EsewaFailure = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center bg-red-50">
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h1>
            <p className="text-sm text-slate-600">
              Your payment could not be processed. No amount has been deducted from your account.
            </p>
          </div>

          {/* Info */}
          <div className="px-6 py-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-800 mb-2">What happened?</h3>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>The payment was cancelled or timed out</li>
                <li>There may have been insufficient balance</li>
                <li>A network error occurred during payment</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
            <button
              onClick={() => navigate('/clientappointment')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0F1A3D] text-white rounded-xl font-semibold text-sm hover:bg-blue-950 transition-colors"
            >
              <RotateCw size={16} />
              Try Again
            </button>
            <button
              onClick={() => navigate('/clientdashboard')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EsewaFailure;
