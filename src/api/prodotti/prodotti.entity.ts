export type ProductCondition =
    | 'new_with_tag'
    | 'new'
    | 'very_good'
    | 'good'
    | 'satisfactory';

export type ProductStatus = 'active' | 'sold' | 'paused';

export interface ProductList {
    items: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type imageUploadSignature = {
    signature: string,
    timestamp: number,
    folder: string,
    apiKey: string,
    cloudName: string
}

export interface Product {
    id: string,
    idSeller: string,
    title: string,
    description: string,
    price: number,
    category: string,
    condition: ProductCondition,
    brand?: string,
    size?: string,
    images: string[],
    status: ProductStatus,
    createdAt?: Date,
    updatedAt?: Date
}