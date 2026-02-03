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
