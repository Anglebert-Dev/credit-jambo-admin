import { useEffect, useState } from 'react';
import { Users, CreditCard, Wallet, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Loader } from '../../common/components/Loader';
import { useAuth } from '../../common/hooks/useAuth';
import { useToast } from '../../common/hooks/useToast';
import { analyticsService } from '../../services/analytics.service';
import { savingsService } from '../../services/savings.service';
import { formatCurrency, formatNumber } from '../../common/utils/format.util';

const DashboardPage = () => {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [savingsStats, setSavingsStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [analytics, savings] = await Promise.all([
        analyticsService.getOverview(),
        savingsService.getAnalytics(),
      ]);
      setOverview(analytics);
      setSavingsStats(savings);
    } catch (err: any) {
      showError(err?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  if (!overview || !savingsStats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">Here's an overview of the system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="md" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-black">
                {formatNumber(overview.users.total)}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-semibold text-green-600">{formatNumber(overview.users.active)}</span> active
              </p>
            </div>
            <div className="p-4 bg-white/60 rounded-full">
              <Users className="text-blue-600" size={28} />
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Credit Requests</p>
              <p className="text-3xl font-bold text-black">
                {formatNumber(overview.credits.total)}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-semibold text-yellow-600">{formatNumber(overview.credits.byStatus.pending)}</span> pending
              </p>
            </div>
            <div className="p-4 bg-white/60 rounded-full">
              <CreditCard className="text-purple-600" size={28} />
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-[#00A651]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Savings</p>
              <p className="text-3xl font-bold text-black">
                {formatCurrency(savingsStats.totalBalance)}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-semibold">{formatNumber(savingsStats.totalAccounts)}</span> accounts
              </p>
            </div>
            <div className="p-4 bg-white/60 rounded-full">
              <Wallet className="text-[#00A651]" size={28} />
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
              <p className="text-3xl font-bold text-black">
                {formatNumber(overview.sessions.active)}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-semibold">{formatNumber(overview.logins.last24h)}</span> logins (24h)
              </p>
            </div>
            <div className="p-4 bg-white/60 rounded-full">
              <Activity className="text-orange-600" size={28} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="text-purple-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-black">Credit Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-bold text-black">
                {formatNumber(overview.credits.byStatus.pending)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-700">Approved</span>
              </div>
              <span className="font-bold text-green-600">
                {formatNumber(overview.credits.byStatus.approved)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-gray-700">Rejected</span>
              </div>
              <span className="font-bold text-red-600">
                {formatNumber(overview.credits.byStatus.rejected)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-700">Disbursed</span>
              </div>
              <span className="font-bold text-blue-600">
                {formatNumber(overview.credits.byStatus.disbursed)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00A651]"></div>
                <span className="text-gray-700">Repaid</span>
              </div>
              <span className="font-bold text-[#00A651]">
                {formatNumber(overview.credits.byStatus.repaid)}
              </span>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wallet className="text-[#00A651]" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-black">Savings Analytics</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Balance</span>
                <TrendingUp className="text-green-600" size={16} />
              </div>
              <p className="text-2xl font-bold text-black">
                {formatCurrency(savingsStats.totalBalance)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="text-blue-600" size={14} />
                  <span className="text-xs text-gray-600">Deposits</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {formatNumber(savingsStats.depositsCount)}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="text-red-600" size={14} />
                  <span className="text-xs text-gray-600">Withdrawals</span>
                </div>
                <p className="text-lg font-bold text-red-600">
                  {formatNumber(savingsStats.withdrawalsCount)}
                </p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Accounts</span>
              <p className="text-xl font-bold text-black mt-1">
                {formatNumber(savingsStats.totalAccounts)}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-black">System Activity</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">Total Users</span>
              <span className="font-bold text-black">
                {formatNumber(overview.users.total)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">Active Users</span>
              <span className="font-bold text-green-600">
                {formatNumber(overview.users.active)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">Active Sessions</span>
              <span className="font-bold text-blue-600">
                {formatNumber(overview.sessions.active)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">Logins (24h)</span>
              <span className="font-bold text-orange-600">
                {formatNumber(overview.logins.last24h)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
