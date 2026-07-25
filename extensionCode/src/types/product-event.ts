export interface ProductInstallments {
  count: number;
  amount: number;
}

export interface CanonicalProduct {
  id?: string;
  title?: string;
  brand?: string;
  category?: string[];
  price?: number;
  originalPrice?: number;
  currency?: string;
  discount?: number;
  seller?: string;
  rating?: number;
  reviews?: number;
  quantity?: number;
  sold?: number;
  freeShipping?: boolean;
  condition?: string;
  installments?: ProductInstallments;
}

export interface ProductInsight {
  interest?: string;
  detectedIntent?: string;
  estimatedCredit?: string;
  cashback?: string;
  confidence?: number;
  purchaseStage?: string;
  urgency?: string;
  reasoning?: string;
  recommendedProducts?: string[];
}

export interface ProductEvent {
  userId: string;
  timestamp: Date;
  nombre?: string | undefined;
  numeroIdentificacion?: string | undefined;
  tipoIdentificacion?: string | undefined;
  merchant: string;
  url: string;
  extensionStorage: Record<string, unknown>;
  product: CanonicalProduct;
  insight: ProductInsight;
}

export interface DatastreamPayload {
  url: string;
  timestamp: string;
  extensionStorage: Record<string, unknown>;
  documentHtml: string;
}
