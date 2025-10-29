import { BadRequestError } from '../../common/exceptions/BadRequestError';
import { NotFoundError } from '../../common/exceptions/NotFoundError';
import { CreditRepaymentDto } from './credit.types';
import { CreditRepository, PrismaCreditRepository } from './credit.repository';
import { NotificationsService } from '../notifications/notifications.service';

export class CreditService {
  constructor(private readonly repo: CreditRepository = new PrismaCreditRepository()) {}

  private generateReference(): string {
    return `CR${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  async makeRepayment(requestId: string, userId: string, data: CreditRepaymentDto) {
    const request = await this.repo.findRequestWithRepayments(requestId);

    if (!request) {
      throw new NotFoundError('Credit request not found');
    }

    if (request.userId !== userId) {
      throw new NotFoundError('Credit request not found');
    }

    if (request.status !== 'approved') {
      throw new BadRequestError('Credit request must be approved before making repayments');
    }

    const totalRepayments = request.repayments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
    const totalOwed = Number(request.amount) * (1 + Number(request.interestRate) / 100);
    const remainingBalance = totalOwed - totalRepayments;

    if (data.amount > remainingBalance) {
      throw new BadRequestError(`Payment amount exceeds remaining balance. Remaining: ${remainingBalance.toFixed(2)}`);
    }

    if (data.amount <= 0) {
      throw new BadRequestError('Payment amount must be greater than 0');
    }

    let referenceNumber = this.generateReference();
    let referenceExists = await this.repo.findRepaymentByReference(referenceNumber);

    while (referenceExists) {
      referenceNumber = this.generateReference();
      referenceExists = await this.repo.findRepaymentByReference(referenceNumber);
    }

    const repayment = await this.repo.createRepayment({
      creditRequestId: requestId,
      amount: data.amount,
      referenceNumber
    });

    return repayment;
  }


  async adminListRequests(page: number = 1, limit: number = 10, status?: string, sortBy: string = 'createdAt', order: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) {
      where.status = status;
    }
    const orderBy: any = { [sortBy]: order };
    const [requests, total] = await Promise.all([
      this.repo.listRequests(where, skip, limit),
      this.repo.countRequests(where)
    ]);
    return { requests, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adminGetRequestDetails(id: string) {
    const req = await this.repo.findRequestWithUserAndRepayments(id);
    if (!req) {
      throw new NotFoundError('Credit request not found');
    }
    return req;
  }

  async approveRequest(id: string, adminId: string) {
    const req = await this.repo.findRequestById(id);
    if (!req) {
      throw new NotFoundError('Credit request not found');
    }
    if (req.status !== 'pending') {
      throw new BadRequestError('Only pending requests can be approved');
    }
    const updated = await this.repo.updateRequestStatus(id, { status: 'approved', approvedBy: adminId, approvedAt: new Date(), rejectionReason: null });
    
    try {
      const notifications = new NotificationsService();
      await notifications.notify({
        userId: req.userId,
        type: 'in_app',
        title: 'Credit request approved',
        message: `Your credit request of ${Number(req.amount).toLocaleString()} has been approved.`
      });
    } catch (_) {}
    
    return updated;
  }

  async rejectRequest(id: string, adminId: string, reason: string) {
    const req = await this.repo.findRequestById(id);
    if (!req) {
      throw new NotFoundError('Credit request not found');
    }
    if (req.status !== 'pending') {
      throw new BadRequestError('Only pending requests can be rejected');
    }
    const updated = await this.repo.updateRequestStatus(id, { status: 'rejected', approvedBy: adminId, approvedAt: null, rejectionReason: reason });
    
    try {
      const notifications = new NotificationsService();
      await notifications.notify({
        userId: req.userId,
        type: 'in_app',
        title: 'Credit request rejected',
        message: `Your credit request of ${Number(req.amount).toLocaleString()} has been rejected. Reason: ${reason}`
      });
    } catch (_) {}
    
    return updated;
  }
}
