
import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/listings/${listing.id}`}>
        <img className="w-full h-48 object-cover" src={listing.imageUrl} alt={listing.title} />
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
