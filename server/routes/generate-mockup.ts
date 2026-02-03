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

    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey) {
      console.error("REPLICATE_API_KEY environment variable is not set");
      return res.status(500).json({
        success: false,
        mockups: { front: "", back: "" },
        error: "Image generation API not configured. Please set REPLICATE_API_KEY environment variable.",
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

    const frontImageUrl = await generateImage(prompt + " - FRONT VIEW", apiKey);
    const backImageUrl = await generateImage(
      prompt + " - BACK VIEW",
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
    console.error("Mockup generation error:", error);
    res.status(500).json({
      success: false,
      mockups: { front: "", back: "" },
      error: "Failed to generate mockups",
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
    console.log("Calling Replicate API to generate image...");
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version:
          "a4a8bafd6d3b93ce8f55e1cdeedfc3fad2ff3a1b04a51191619da2cc59239445",
        input: {
          prompt: prompt,
          num_outputs: 1,
          guidance_scale: 7.5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Replicate API error (${response.status}):`,
        errorText
      );
      throw new Error(
        `Image generation API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as {
      id: string;
      status: string;
      output?: string[];
    };

    console.log("Prediction created:", data.id);

    let prediction = data;
    let maxAttempts = 120;
    let attempts = 0;

    while (
      (prediction.status === "starting" ||
        prediction.status === "processing") &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${apiKey}`,
          },
        }
      );

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.error(
          `Poll error (${pollResponse.status}):`,
          errorText
        );
        throw new Error(`Failed to poll prediction status`);
      }

      prediction = (await pollResponse.json()) as {
        id: string;
        status: string;
        output?: string[];
        error?: string;
      };

      console.log(
        `Polling... Status: ${prediction.status} (attempt ${attempts + 1}/${maxAttempts})`
      );
      attempts++;
    }

    if (prediction.status === "succeeded" && prediction.output?.[0]) {
      console.log("Image generation succeeded");
      return prediction.output[0];
    }

    console.error(
      `Image generation failed. Final status: ${prediction.status}`,
      prediction.error
    );
    throw new Error(
      `Image generation failed with status: ${prediction.status}${prediction.error ? `: ${prediction.error}` : ""}`
    );
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}
