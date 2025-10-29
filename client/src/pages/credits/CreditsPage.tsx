import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Filter } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Loader } from '../../common/components/Loader';
import { useToast } from '../../common/hooks/useToast';
import { creditService } from '../../services/credit.service';
import { formatCurrency, formatDateTime } from '../../common/utils/format.util';
import { ROUTES } from '../../config/routes.config';
import type { AdminCreditRequest } from '../../common/types/user.types';

const CreditsPage = () => {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [requests, setRequests] = useState<AdminCreditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchCredits();
  }, [page, status]);

  const fetchCredits = async () => {
    try {
      setIsLoading(true);
      const result = await creditService.list({
        page,
        limit,
        status: status || undefined,
        sortBy: 'createdAt',
        order: 'desc',
      });
      setRequests(result.data);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err: any) {
      showError(err?.message || 'Failed to load credit requests');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      disbursed: 'bg-blue-100 text-blue-700',
      repaid: 'bg-[#00A651]/10 text-[#00A651]',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading && requests.length === 0) {
    return <Loader fullScreen size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Credit Requests</h1>
          <p className="text-gray-600 mt-1">Manage and review credit requests</p>
        </div>
      </div>

      <Card padding="md">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600">Filter by status:</span>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="disbursed">Disbursed</option>
            <option value="repaid">Repaid</option>
          </select>
          {status && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus('')}
            >
              Clear Filter
            </Button>
          )}
        </div>

        {isLoading ? (
          <Loader />
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No credit requests found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Purpose</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Interest</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-black">{formatCurrency(request.amount)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700 max-w-md truncate" title={request.purpose}>
                          {request.purpose}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{request.durationMonths} months</td>
                      <td className="px-4 py-3 text-gray-700">{request.interestRate}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateTime(request.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(ROUTES.CREDIT_DETAILS(request.id))}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages} ({total} total)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default CreditsPage;
