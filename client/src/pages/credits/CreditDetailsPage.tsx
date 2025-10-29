import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CreditCard,  CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Loader } from '../../common/components/Loader';
import { Modal } from '../../common/components/Modal';
import { useToast } from '../../common/hooks/useToast';
import { creditService } from '../../services/credit.service';
import { formatCurrency, formatDateTime } from '../../common/utils/format.util';
import { ROUTES } from '../../config/routes.config';

const CreditDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveRate, setApproveRate] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCreditDetails();
    }
  }, [id]);

  const fetchCreditDetails = async () => {
    try {
      setIsLoading(true);
      const data = await creditService.details(id!);
      setRequest(data);
    } catch (err: any) {
      showError(err?.message || 'Failed to load credit details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      setIsProcessing(true);
      const rateNum = approveRate.trim() ? Number(approveRate) : undefined;
      await creditService.approve(id, rateNum && rateNum > 0 ? rateNum : undefined);
      success('Credit request approved successfully');
      setShowApproveModal(false);
      setApproveRate('');
      fetchCreditDetails();
    } catch (err: any) {
      showError(err?.message || 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      showError('Please provide a rejection reason');
      return;
    }
    try {
      setIsProcessing(true);
      await creditService.reject(id, rejectReason);
      success('Credit request rejected');
      setShowRejectModal(false);
      setRejectReason('');
      fetchCreditDetails();
    } catch (err: any) {
      showError(err?.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      repaid: 'bg-[#00A651]/10 text-[#00A651]',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const calculateTotalOwed = () => {
    if (!request) return 0;
    return Number(request.amount) * (1 + Number(request.interestRate) / 100);
  };

  const calculateRepaidAmount = () => {
    if (!request?.repayments) return 0;
    return request.repayments.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
  };

  if (isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  if (!request) {
    return <div className="text-center py-12">Credit request not found</div>;
  }

  const totalOwed = calculateTotalOwed();
  const repaidAmount = calculateRepaidAmount();
  const remainingBalance = totalOwed - repaidAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.CREDITS)}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-black">Credit Request Details</h1>
          <p className="text-gray-600 mt-1">View and manage credit request</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-purple-600" size={20} />
              <h2 className="text-lg font-semibold text-black">Request Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-2xl font-bold text-black">{formatCurrency(request.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="font-medium text-black">{request.durationMonths} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
                <p className="font-medium text-black">{request.interestRate}%</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Purpose</p>
                <p className="text-gray-700">{request.purpose}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created</p>
                <p className="text-sm text-gray-700">{formatDateTime(request.createdAt)}</p>
              </div>
              {request.approvedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved At</p>
                  <p className="text-sm text-gray-700">{formatDateTime(request.approvedAt)}</p>
                </div>
              )}
              {request.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{request.rejectionReason}</p>
                </div>
              )}
            </div>
          </Card>

          {request.user && (
            <Card padding="md">
              <div className="flex items-center gap-3 mb-6">
                <User className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-black">User Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-black">
                    {request.user.firstName} {request.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-black break-all">{request.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-black break-all">{request.user.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(request.user.status)}`}>
                    {request.user.status}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {request.repayments && request.repayments.length > 0 && (
            <Card padding="md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-[#00A651]" size={20} />
                  <h2 className="text-lg font-semibold text-black">Repayment History</h2>
                </div>
              </div>
              <div className="space-y-2">
                {request.repayments.map((repayment: any) => (
                  <div key={repayment.id} className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="min-w-0">
                      <p className="font-medium text-black">{formatCurrency(repayment.amount)}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(repayment.paymentDate)}</p>
                    </div>
                    <span className="text-xs text-gray-500 break-all">{repayment.referenceNumber}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="text-[#00A651]" size={20} />
              <h2 className="text-lg font-semibold text-black">Payment Summary</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold text-black">{formatCurrency(request.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Interest ({request.interestRate}%)</span>
                <span className="font-semibold text-black">
                  {formatCurrency(totalOwed - request.amount)}
                </span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="font-medium text-gray-700">Total Owed</span>
                <span className="font-bold text-black">{formatCurrency(totalOwed)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Repaid</span>
                <span className="font-semibold text-green-600">{formatCurrency(repaidAmount)}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="font-medium text-gray-700">Remaining</span>
                <span className="font-bold text-[#00A651]">{formatCurrency(remainingBalance)}</span>
              </div>
            </div>
          </Card>

          {request.status === 'pending' && (
            <Card padding="md">
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowApproveModal(true)}
                >
                  <CheckCircle size={18} className="mr-2" />
                  Approve Request
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50"
                  onClick={() => setShowRejectModal(true)}
                >
                  <XCircle size={18} className="mr-2" />
                  Reject Request
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Credit Request"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Approve this credit request of {formatCurrency(request?.amount)}.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Override Interest Rate (optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={approveRate}
              onChange={(e) => setApproveRate(e.target.value)}
              placeholder={`${request?.interestRate}`}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00A651] focus:border-[#00A651] focus:outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to keep {request?.interestRate}%.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApprove} isLoading={isProcessing}>
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Reject Credit Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00A651] focus:border-[#00A651] focus:outline-none transition-all"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              rows={4}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleReject} isLoading={isProcessing}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreditDetailsPage;

