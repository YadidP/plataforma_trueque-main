import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : listing.imageUrl
      ? [{ imageUrl: listing.imageUrl } as any]
      : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
      <Link to={`/listings/${listing.id}`} className="block h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={images[currentImageIndex]?.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
          />
          {/* Badge de cantidad restante */}
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            Stock: {listing.quantity}
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">
                {listing.title}
            </h3>
          </div>
          
          <p className="text-sm text-gray-500 mt-1 mb-3">por {listing.authorName}</p>

          {/* SECCIÓN DE IMPACTO ELIMINADA AQUÍ, SOLO QUEDA PRECIO Y BOTÓN */}

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
            <span className="text-xl font-extrabold text-green-600">
              {listing.unitCredits} <span className="text-xs font-normal text-gray-400">créditos</span>
            </span>
            <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg group-hover:bg-green-100 transition-colors">
              Ver Detalle →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;