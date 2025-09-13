import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditLog, Wallet } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(CreditLog)
    private creditLogRepository: Repository<CreditLog>,
  ) {}

  async getBalance(userId: number) {
    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException('Billetera no encontrada para este usuario.');
    }
    return wallet;
  }

  getMovements(userId: number) {
    return this.creditLogRepository.find({
      where: { userId },
      order: { logDate: 'DESC' },
      // Mapeo para que coincida con la interfaz `CreditMovement` del frontend
      select: {
        id: true,
        logDate: true,
        operationType: true,
        delta: true,
        balanceAfter: true,
      },
    }).then(logs => logs.map(log => ({
        id: log.id,
        date: log.logDate.toISOString(),
        description: log.operationType,
        delta: Number(log.delta),
        balanceAfter: Number(log.balanceAfter)
    })));
  }
}
