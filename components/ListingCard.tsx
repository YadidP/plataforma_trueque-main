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
      
  // Aseguramos acceso a author
  const authorId = listing.author?.id || listing.authorId;
  const authorName = listing.author?.name || listing.authorName || 'Usuario';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col h-full">
      {/* Área Clicable principal para ir al detalle */}
      <Link to={`/listings/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={images[currentImageIndex]?.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
          />
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            Stock: {listing.quantity}
          </div>
          {listing.discountPercent > 0 && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  -{listing.discountPercent}% OFF
              </div>
          )}
      </Link>
        
      <div className="p-4 flex flex-col flex-grow">
          {/* Título en enlace */}
          <Link to={`/listings/${listing.id}`} className="block">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">
                {listing.title}
            </h3>
          </Link>
          
          {/* NUEVO: Autor Clicable */}
          <div className="mt-1 mb-3 text-sm text-gray-500 flex items-center gap-1">
            <span>por</span>
            <Link 
                to={`/profile/${authorId}`}
                className="font-medium text-gray-700 hover:text-green-600 hover:underline transition-colors flex items-center gap-1 z-10 relative"
                onClick={(e) => e.stopPropagation()} // Evita que el clic propague al card completo si estuviera envuelto
            >
                👤 {authorName}
            </Link>
          </div>

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="flex flex-col">
                  {listing.originalPrice > listing.unitCredits && (
                      <span className="text-xs text-gray-400 line-through decoration-red-500">
                          {listing.originalPrice}
                      </span>
                  )}
                  <span className="text-xl font-extrabold text-green-600">
                      {listing.unitCredits} <span className="text-xs font-normal text-gray-400">créditos</span>
                  </span>
              </div>
            <Link 
                to={`/listings/${listing.id}`}
                className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg group-hover:bg-green-100 transition-colors"
            >
              Ver Detalle →
            </Link>
          </div>
      </div>
    </div>
  );
};

export default ListingCard;