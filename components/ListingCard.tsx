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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[currentImageIndex];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/listings/${listing.id}`} className="relative group">
        <img 
          src={currentImage?.imageUrl}  // Uses mapped full path
          alt={listing.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            console.error(`Image error for listing ${listing.id}: src=${(e.target as HTMLImageElement).src}`);  // Log if fails
            (e.target as HTMLImageElement).src = '/placeholder.jpg';  // Fallback only on error
          }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ‹
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ›
            </button>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 truncate">{listing.title}</h3>
          <p className="text-sm text-gray-600 mt-1">por {listing.authorName}</p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-xl font-bold text-green-primary">
              {listing.unitCredits} créditos
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{listing.status}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
