/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Request type for /api/generate-mockup
 */
export interface GenerateMockupRequest {
  clothingType: string;
  baseColor: string;
  fit: string;
  brandingStyle: string;
  placement: string;
  designPrompt: string;
}

/**
 * Response type for /api/generate-mockup
 */
export interface GenerateMockupResponse {
  success: boolean;
  mockups: {
    front: string;
    back: string;
  };
  error?: string;
}

export interface DeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  walletAddress: string;
  itemName: string;
  collectionName: string;
  image?: string;
  size?: string;
  color: string;
  quantity: number;
  price: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  estimatedDelivery?: string;
  paymentMethod?: "payment-link";
  deliveryDetails?: DeliveryDetails;
}

export interface OrderListResponse {
  orders: Order[];
}

export interface SupportTicketRequest {
  name: string;
  email: string;
  message: string;
  walletAddress?: string;
}

export interface SupportTicketResponse {
  success: boolean;
  ticketId?: string;
  createdAt?: string;
  error?: string;
}
