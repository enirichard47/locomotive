import { RequestHandler } from "express";

interface MockupRequest {
  clothingType: string;
  baseColor: string;
  fit: string;
  brandingStyle: string;
  placement: string;
  designPrompt: string;
}

interface MockupResponse {
  success: boolean;
  mockups: {
    front: string;
    back: string;
  };
  error?: string;
}

export const handleGenerateMockup: RequestHandler = async (req, res) => {
  try {
    const {
      clothingType,
      baseColor,
      fit,
      brandingStyle,
      placement,
      designPrompt,
    } = req.body as MockupRequest;

    console.log("Generate mockup request received:", {
      clothingType,
      baseColor,
      fit,
      brandingStyle,
      placement,
      designPrompt: designPrompt.substring(0, 50),
    });

    if (!designPrompt) {
      return res.status(400).json({
        success: false,
        mockups: { front: "", back: "" },
        error: "Design prompt is required",
      });
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      console.error("GROK_API_KEY environment variable is not set");
      return res.status(500).json({
        success: false,
        mockups: { front: "", back: "" },
        error: "Image generation API not configured. Please set GROK_API_KEY environment variable.",
      });
    }

    const prompt = buildPrompt(
      clothingType,
      baseColor,
      fit,
      brandingStyle,
      placement,
      designPrompt
    );

    const frontImageUrl = await generateImage(
      `${prompt} - FRONT VIEW`,
      apiKey
    );
    const backImageUrl = await generateImage(
      `${prompt} - BACK VIEW`,
      apiKey
    );

    res.json({
      success: true,
      mockups: {
        front: frontImageUrl,
        back: backImageUrl,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate mockups";
    console.error("Mockup generation error:", error);
    res.status(500).json({
      success: false,
      mockups: { front: "", back: "" },
      error: message,
    });
  }
};

function buildPrompt(
  clothingType: string,
  baseColor: string,
  fit: string,
  brandingStyle: string,
  placement: string,
  designPrompt: string
): string {
  return `Professional product mockup of a ${fit} fit ${clothingType} in ${baseColor} color. ${brandingStyle} branding style on the ${placement}. Design: ${designPrompt}. High quality, photorealistic, studio lighting, white background, professional product photography.`;
}

async function generateImage(prompt: string, apiKey: string): Promise<string> {
  try {
    console.log("Calling Grok API to generate image...");
    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-imagine-image",
        prompt,
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Grok API error (${response.status}):`,
        errorText
      );
      throw new Error(
        `Grok API error (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = (await response.json()) as {
      data?: Array<{
        url?: string;
        b64_json?: string;
      }>;
    };

    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL returned in Grok API response");
    }

    console.log("Image generation succeeded");
    return imageUrl;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}
