import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { PgService } from 'src/database/pg.service'; // Import PgService
import { ImpactService } from '../impact/impact.service';

@Injectable()
export class ListingsService {
  constructor(
    private readonly pgService: PgService, // Inject PgService
    private impactService: ImpactService,
  ) { }

  async create(createListingDto: CreateListingDto, authorId: number, imageUrls: string[]) {
    const {
      title,
      description,
      categoryId,
      subcategoryId,
      materialId,
      unitCredits,
      quantity,
      quantityRange,
      unitLabel,
    } = createListingDto;

    const query = `
      INSERT INTO listings (
        author_id, title, description, category_id, subcategory_id,
        material_id, quantity, quantity_range, unit_credits, unit_label, image_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *;
    `;
    const values = [
      authorId, title, description, Number(categoryId), Number(subcategoryId),
      materialId ? Number(materialId) : null, quantity ? Number(quantity) : null,
      quantityRange, Number(unitCredits), unitLabel, imageUrls[0] || null
    ];

    const result = await this.pgService.query(query, values);
    const savedListing = result.rows[0];

    // Save all images
    if (imageUrls && imageUrls.length > 0) {
      const imageInsertQueries = imageUrls.map((url, index) => {
        return `
          INSERT INTO listing_images (listing_id, image_url, display_order)
          VALUES ($1, $2, $3);
        `;
      });
      const imageInsertValues = imageUrls.flatMap((url, index) => [savedListing.id, url, index]);

      // Execute in a transaction if needed, for simplicity executing individually for now
      for (let i = 0; i < imageInsertQueries.length; i++) {
        await this.pgService.query(imageInsertQueries[i], [savedListing.id, imageUrls[i], i]);
      }
    }
    
    // Fetch images to return with the listing
    const imagesResult = await this.pgService.query(
      `SELECT id, listing_id as "listingId", image_url as "imageUrl", display_order as "displayOrder" FROM listing_images WHERE listing_id = $1 ORDER BY display_order ASC;`,
      [savedListing.id]
    );
    savedListing.images = imagesResult.rows;

    return savedListing;
  }

  async findAll() {
    const query = `
      SELECT
        l.id, l.title, l.description, l.image_url as "imageUrl", l.status,
        l.unit_credits as "unitCredits", l.quantity, l.unit_label as "unitLabel",
        l.material_id as "materialId",
        l.category_id as "categoryId", -- AGREGADO: Faltaba esto para que el filtro funcione
        l.created_at as "createdAt",
        u.name as author_name, u.id as author_id,
        -- Detectar si el autor tiene suscripción Premium activa (ID 2 es el ejemplo de Premium)
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM user_subscriptions us 
                JOIN subscriptions s ON us.subscription_id = s.id
                WHERE us.user_id = l.author_id 
                AND s.name LIKE '%Premium%' 
                AND us.is_active = true 
                AND us.end_date > NOW()
            ) THEN 1 
            ELSE 0 
        END as is_premium
      FROM listings l
      JOIN users u ON l.author_id = u.id
      WHERE l.status = 'activa'
      ORDER BY is_premium DESC, l.created_at DESC; -- Primero Premium, luego los más recientes
    `;
    
    const result = await this.pgService.query(query);

    return Promise.all(result.rows.map(async (listing) => {
      let potentialImpact = [];
      if (listing.materialId && listing.quantity && listing.unitLabel) {
        try {
          potentialImpact = await this.impactService.calculateImpactPreview({
            material_id: listing.materialId,
            quantity: Number(listing.quantity),
            quantity_unit: listing.unitLabel
          });
        } catch (e) {}
      }
      return {
        ...listing,
        author: { name: listing.author_name, id: listing.author_id, isPremium: listing.is_premium === 1 },
        potentialImpact
      };
    }));
  }

  async findOne(id: number) {
    const query = `
      SELECT
        l.id, l.title, l.description, l.image_url as "imageUrl", l.status,
        l.unit_credits as "unitCredits", l.quantity, l.unit_label as "unitLabel",
        l.quantity_range as "quantityRange", l.material_id as "materialId",
        l.created_at as "createdAt",
        u.name as author_name, u.id as author_id,
        c.name as category_name, c.id as category_id
      FROM listings l
      JOIN users u ON l.author_id = u.id
      JOIN categories c ON l.category_id = c.id
      WHERE l.id = $1;
    `;
    const result = await this.pgService.query(query, [id]);
    const listing = result.rows[0];

    if (!listing) {
      throw new NotFoundException(`Publicación con ID ${id} no encontrada.`);
    }

    const imagesResult = await this.pgService.query(
      `SELECT id, listing_id as "listingId", image_url as "imageUrl", display_order as "displayOrder" FROM listing_images WHERE listing_id = $1 ORDER BY display_order ASC;`,
      [id]
    );
    listing.images = imagesResult.rows;

    let potentialImpact = [];
    if (listing.materialId && listing.quantity && listing.unitLabel) {
      potentialImpact = await this.impactService.calculateImpactPreview({
        material_id: listing.materialId,
        quantity: listing.quantity,
        quantity_unit: listing.unitLabel
      });
    }

    return {
      ...listing,
      author: { name: listing.author_name, id: listing.author_id },
      category: { name: listing.category_name, id: listing.category_id },
      potentialImpact
    };
  }

  async findByAuthor(authorId: number) {
    const query = `
      SELECT
        id, title, description, image_url as "imageUrl", status,
        unit_credits as "unitCredits", quantity, unit_label as "unitLabel",
        material_id as "materialId",
        created_at as "createdAt"
      FROM listings
      WHERE author_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await this.pgService.query(query, [authorId]);
    
    return Promise.all(result.rows.map(async (listing) => {
      let potentialImpact = [];
      
      if (listing.materialId && listing.quantity && listing.unitLabel) {
        try {
          potentialImpact = await this.impactService.calculateImpactPreview({
            material_id: listing.materialId,
            quantity: Number(listing.quantity),
            quantity_unit: listing.unitLabel
          });
        } catch (e) {
          console.error(`Error calculando impacto para listing ${listing.id}`, e);
        }
      }
      
      return {
        ...listing,
        potentialImpact
      };
    }));
  }

  async update(id: number, updateListingDto: UpdateListingDto, userId: number, newImageUrls: string[]) {
    const existingListingQuery = await this.pgService.query(
      `SELECT author_id as "authorId" FROM listings WHERE id = $1;`,
      [id]
    );
    const existingListing = existingListingQuery.rows[0];

    if (!existingListing) throw new NotFoundException('Publicación no encontrada');
    if (existingListing.authorId !== userId) throw new ForbiddenException('No tienes permiso para editar esta publicación');

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (updateListingDto.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(updateListingDto.title);
    }
    if (updateListingDto.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(updateListingDto.description);
    }
    if (updateListingDto.categoryId !== undefined) {
      updateFields.push(`category_id = $${paramIndex++}`);
      updateValues.push(Number(updateListingDto.categoryId));
    }
    if (updateListingDto.subcategoryId !== undefined) {
      updateFields.push(`subcategory_id = $${paramIndex++}`);
      updateValues.push(Number(updateListingDto.subcategoryId));
    }
    if (updateListingDto.materialId !== undefined) {
      updateFields.push(`material_id = $${paramIndex++}`);
      updateValues.push(Number(updateListingDto.materialId));
    }
    if (updateListingDto.unitCredits !== undefined) {
      updateFields.push(`unit_credits = $${paramIndex++}`);
      updateValues.push(Number(updateListingDto.unitCredits));
    }
    if (updateListingDto.quantity !== undefined) {
      updateFields.push(`quantity = $${paramIndex++}`);
      updateValues.push(Number(updateListingDto.quantity));
    }
    if (updateListingDto.unitLabel !== undefined) {
      updateFields.push(`unit_label = $${paramIndex++}`);
      updateValues.push(updateListingDto.unitLabel);
    }

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE listings
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *;
      `;
      updateValues.push(id);
      await this.pgService.query(updateQuery, updateValues);
    }

    // 2. Manejo de Imágenes
    let keptUrls: string[] = [];
    if (updateListingDto.keptImageUrls) {
      try {
        keptUrls = JSON.parse(updateListingDto.keptImageUrls);
        if (!Array.isArray(keptUrls)) keptUrls = [];
      } catch (e) { keptUrls = []; }
    }

    // A) Borrar de la DB las imágenes que no están en la lista de 'keptUrls'
    // First, get current images
    const currentImagesResult = await this.pgService.query(
      `SELECT id, image_url as "imageUrl" FROM listing_images WHERE listing_id = $1;`,
      [id]
    );
    const currentImages = currentImagesResult.rows;
    
    const imagesToDelete = currentImages.filter(img => !keptUrls.includes(img.imageUrl));
    if (imagesToDelete.length > 0) {
      const deleteIds = imagesToDelete.map(img => img.id);
      await this.pgService.query(`DELETE FROM listing_images WHERE id = ANY($1);`, [deleteIds]);
    }

    // B) Guardar las nuevas imágenes
    if (newImageUrls.length > 0) {
      const newImagesInsertValues = newImageUrls.map((url, index) => [id, url, keptUrls.length + index]);
      const newImagesInsertQuery = `
        INSERT INTO listing_images (listing_id, image_url, display_order)
        VALUES ${newImagesInsertValues.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ')};
      `;
      await this.pgService.query(newImagesInsertQuery, newImagesInsertValues.flat());
    }

    // C) Actualizar la imagen principal (thumbnail) si cambió
    const allImagesResult = await this.pgService.query(
      `SELECT image_url as "imageUrl" FROM listing_images WHERE listing_id = $1 ORDER BY display_order ASC;`,
      [id]
    );
    const allImages = allImagesResult.rows;

    let newMainImageUrl: string | null = null;
    if (allImages.length > 0) {
      newMainImageUrl = allImages[0].imageUrl;
    }

    await this.pgService.query(
      `UPDATE listings SET image_url = $1 WHERE id = $2;`,
      [newMainImageUrl, id]
    );

    const updatedListingResult = await this.pgService.query(
      `SELECT * FROM listings WHERE id = $1;`,
      [id]
    );
    const updatedListing = updatedListingResult.rows[0];

    // Fetch images to return with the updated listing
    const finalImagesResult = await this.pgService.query(
      `SELECT id, listing_id as "listingId", image_url as "imageUrl", display_order as "displayOrder" FROM listing_images WHERE listing_id = $1 ORDER BY display_order ASC;`,
      [id]
    );
    updatedListing.images = finalImagesResult.rows;

    return updatedListing;
  }
}
