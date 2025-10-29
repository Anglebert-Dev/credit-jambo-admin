import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Wallet, CreditCard, Activity, Monitor, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Loader } from '../../common/components/Loader';
import { Modal } from '../../common/components/Modal';
import { useToast } from '../../common/hooks/useToast';
import { userService } from '../../services/user.service';
import { formatCurrency, formatDateTime } from '../../common/utils/format.util';
import { ROUTES } from '../../config/routes.config';
import type { AdminUserDetails } from '../../common/types/user.types';

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [user, setUser] = useState<AdminUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const data = await userService.details(id!);
      setUser(data);
      setNewStatus(data.status);
    } catch (err: any) {
      showError(err?.message || 'Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!id || !newStatus) return;
    try {
      setIsUpdating(true);
      await userService.updateStatus(id, newStatus);
      success('Status updated successfully');
      setShowStatusModal(false);
      fetchUserDetails();
    } catch (err: any) {
      showError(err?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsUpdating(true);
      await userService.delete(id);
      success('User deleted successfully');
      navigate(ROUTES.USERS);
    } catch (err: any) {
      showError(err?.message || 'Failed to delete user');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      deleted: 'bg-gray-100 text-gray-700',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  if (!user) {
    return <div className="text-center py-12">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.USERS)}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-black">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>
        {user.role !== 'admin' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setShowStatusModal(true)}
            >
              <Edit2 size={16} className="mr-2" />
              Update Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-black">User Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-medium text-black">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Phone</p>
              <p className="font-medium text-black">{user.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Role</p>
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                {user.role}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(user.status)}`}>
                {user.status}
              </span>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="text-sm text-gray-700">{formatDateTime(user.createdAt)}</p>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {user.savingsAccount && (
            <Card padding="md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Wallet className="text-[#00A651]" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-black">Savings Account</h2>
              </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-black">
                    {formatCurrency(user.savingsAccount.balance, user.savingsAccount.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(user.savingsAccount.status)}`}>
                    {user.savingsAccount.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created</p>
                  <p className="text-sm text-gray-700">{formatDateTime(user.savingsAccount.createdAt)}</p>
                </div>
              </div>
            </Card>
          )}

          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="text-purple-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-black">Credit Activity</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-black">{user.credit.counts.pending}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600">{user.credit.counts.approved}</p>
                <p className="text-xs text-gray-600">Approved</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-xl font-bold text-red-600">{user.credit.counts.rejected}</p>
                <p className="text-xs text-gray-600">Rejected</p>
              </div>
              <div className="text-center p-3 bg-[#00A651]/10 rounded-lg">
                <p className="text-xl font-bold text-[#00A651]">{user.credit.counts.repaid}</p>
                <p className="text-xs text-gray-600">Repaid</p>
              </div>
            </div>
            {user.credit.requests.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Requests</h3>
                {user.credit.requests.slice(0, 5).map((req) => (
                  <div key={req.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-black">{formatCurrency(req.amount)}</p>
                      <p className="text-sm text-gray-600">{req.purpose}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No credit requests</p>
            )}
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="text-orange-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-black">Login Activity</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
                <p className="text-2xl font-bold text-black">{user.activity.sessionsActive}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Recent Logins</p>
                <p className="text-2xl font-bold text-black">{user.activity.recentLogins.length}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Devices</h3>
              {user.activity.devices.length > 0 ? (
                user.activity.devices.map((device, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors">
                    <Monitor size={16} className="text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">{device.deviceInfo || 'Unknown Device'}</p>
                      <p className="text-xs text-gray-500">
                        {device.ipAddress} • Last seen: {formatDateTime(device.lastSeenAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No device information available</p>
              )}
            </div>
            {user.activity.recentLogins.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Logins</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {user.activity.recentLogins.slice(0, 10).map((login, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <p>{formatDateTime(login.createdAt)}</p>
                      {login.deviceInfo && <p className="text-gray-500">{login.deviceInfo}</p>}
                      {login.ipAddress && <p className="text-gray-500">IP: {login.ipAddress}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update User Status"
      >
        <div className="space-y-4">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateStatus} isLoading={isUpdating}>
              Update
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              isLoading={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailsPage;

