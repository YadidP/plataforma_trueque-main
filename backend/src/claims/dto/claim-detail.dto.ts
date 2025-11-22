export class ClaimDetailDto {
    id: number;
    exchangeId: number | null;
    listingId: number | null;
    claimantId: number;
    claimantName: string;
    reason: string;
    status: string;
    createdAt: Date;
    resolvedAt: Date | null;

    // Additional details
    exchangeDetails?: {
        id: number;
        listingTitle: string;
        buyerName: string;
        sellerName: string;
    };

    listingDetails?: {
        id: number;
        title: string;
        authorName: string;
    };
}
