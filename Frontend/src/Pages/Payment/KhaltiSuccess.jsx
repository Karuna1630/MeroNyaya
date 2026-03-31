import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyKhaltiPayment, verifyKhaltiCasePayment, clearVerifiedPayment } from '../slices/paymentSlice';
import { CheckCircle, Loader2, XCircle, ArrowLeft, Calendar, FileText } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const KhaltiSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { verifying, verifyError, verifiedPayment } = useSelector((state) => state.payment);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const pidx = searchParams.get('pidx');
    const transaction_id = searchParams.get('transaction_id');
    const purchase_order_id = searchParams.get('purchase_order_id');
    const type = searchParams.get('type');
    
    if (pidx && !verified) {
      const verifyThunk = type === 'case' ? verifyKhaltiCasePayment : verifyKhaltiPayment;
      dispatch(verifyThunk({ pidx, transaction_id, purchase_order_id })).then((res) => {
        if (!res.error) {
          setVerified(true);
        }
      });
    }
    return () => {
      dispatch(clearVerifiedPayment());
    };
  }, [dispatch, searchParams, verified]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-8 text-center ${
            verifying ? 'bg-purple-50' : verifyError ? 'bg-red-50' : 'bg-emerald-50'
          }`}>
            {verifying ? (
              <Loader2 size={64} className="mx-auto text-purple-500 animate-spin mb-4" />
            ) : verifyError ? (
              <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            ) : (
              <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
            )}

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {verifying
                ? 'Verifying Payment...'
                : verifyError
                ? 'Verification Failed'
                : 'Payment Successful!'}
            </h1>
            <p className="text-sm text-slate-600">
              {verifying
                ? 'Please wait while we confirm your payment with Khalti.'
                : verifyError
                ? verifyError
                : searchParams.get('type') === 'case'
                ? 'Your case payment has been confirmed and the case is now completed.'
                : 'Your consultation appointment has been confirmed.'}
            </p>
          </div>

          {/* Payment Details */}
          {verifiedPayment?.payment && !verifying && (
            <div className="px-6 py-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Transaction ID</span>
                <span className="text-sm font-mono font-semibold text-slate-900">
                  {verifiedPayment.payment.transaction_uuid?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Amount Paid</span>
                <span className="text-sm font-bold text-emerald-600">
                  Rs. {parseFloat(verifiedPayment.payment.total_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Payment Method</span>
                <span className="text-sm font-semibold text-purple-700">Khalti</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500">Status</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle size={12} /> Completed
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
            {searchParams.get('type') === 'case' ? (
              <button
                onClick={() => navigate('/client/cases')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0F1A3D] text-white rounded-xl font-semibold text-sm hover:bg-blue-950 transition-colors"
              >
                <FileText size={16} />
                View My Cases
              </button>
            ) : (
              <button
                onClick={() => navigate('/clientappointment')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0F1A3D] text-white rounded-xl font-semibold text-sm hover:bg-blue-950 transition-colors"
              >
                <Calendar size={16} />
                View Appointments
              </button>
            )}
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

export default KhaltiSuccess;
