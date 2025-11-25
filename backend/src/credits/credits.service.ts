import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { PgService } from 'src/database/pg.service'; // Import PgService
import { CreditPackage } from './dto/credit-package.dto'; // Import CreditPackage from DTO file

@Injectable()
export class CreditsService {
  // En un sistema real, esto vendría de una tabla de configuración en la DB.
  private readonly packages: CreditPackage[] = [
    { id: 1, credits: 50, priceBs: 15.00 },
    { id: 2, credits: 100, priceBs: 25.00 },
    { id: 3, credits: 200, priceBs: 50.00 },
  ];

  constructor(private pgService: PgService) {} // Inject PgService

  getCreditPackages(): CreditPackage[] {
    return this.packages;
  }

  async purchase(userId: number, purchaseCreditsDto: PurchaseCreditsDto) {
    const pkg = this.packages.find(p => p.id === purchaseCreditsDto.creditsPackageId);

    if (!pkg) {
      throw new BadRequestException('El paquete de créditos seleccionado no es válido.');
    }

    try {
      // Llamada al procedimiento almacenado
      await this.pgService.query(
        'CALL sp_comprar_creditos($1, $2, $3, $4)',
        [userId, pkg.credits, pkg.priceBs, purchaseCreditsDto.paymentRef],
      );
      return { message: 'Compra realizada con éxito.' };
    } catch (error: any) {
      console.error("Error al ejecutar sp_comprar_creditos:", error);
      throw new InternalServerErrorException('Ocurrió un error al procesar la compra.');
    }
  }
}
