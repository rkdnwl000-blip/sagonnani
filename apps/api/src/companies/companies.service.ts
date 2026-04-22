import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(companyId: string) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true, businessName: true, ownerName: true, phone: true,
        email: true, address: true, status: true, commissionBalance: true,
        rating: true, ratingCount: true, createdAt: true,
      },
    });
  }

  async getTransactions(companyId: string) {
    return this.prisma.commissionTransaction.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getMyQuotes(companyId: string) {
    return this.prisma.quote.findMany({
      where: { companyId },
      include: {
        request: {
          select: {
            id: true,
            accidentLocation: true,
            vehicleCategory: true,
            myVehicleModel: true,
            myVehiclePlate: true,
            status: true,
            createdAt: true,
          },
        },
        vehicle: { select: { name: true, year: true, plateNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
