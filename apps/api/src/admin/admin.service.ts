import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [totalUsers, totalCompanies, totalRequests, activeRequests, totalRevenue] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.company.count(),
        this.prisma.rentalRequest.count(),
        this.prisma.rentalRequest.count({ where: { status: { in: ['MATCHING', 'CONFIRMED', 'IN_USE'] } } }),
        this.prisma.commissionTransaction.aggregate({
          _sum: { amount: true },
          where: { type: 'DEDUCT' },
        }),
      ]);

    return {
      totalUsers,
      totalCompanies,
      totalRequests,
      activeRequests,
      totalRevenue: Math.abs(totalRevenue._sum.amount || 0),
    };
  }

  async getCompanies(status?: string) {
    return this.prisma.company.findMany({
      where: status ? { status: status as any } : undefined,
      select: {
        id: true, businessName: true, ownerName: true, phone: true,
        status: true, commissionBalance: true, rating: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveCompany(id: string) {
    return this.prisma.company.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  async suspendCompany(id: string) {
    return this.prisma.company.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  async chargeCommission(companyId: string, amount: number) {
    return this.prisma.$transaction([
      this.prisma.company.update({
        where: { id: companyId },
        data: { commissionBalance: { increment: amount } },
      }),
      this.prisma.commissionTransaction.create({
        data: { companyId, amount, type: 'CHARGE' },
      }),
    ]);
  }

  async getRequests(status?: string) {
    return this.prisma.rentalRequest.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        user: { select: { name: true, phone: true } },
        quotes: { where: { status: 'ACCEPTED' }, include: { company: { select: { businessName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
