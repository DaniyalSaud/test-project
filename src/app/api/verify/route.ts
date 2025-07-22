import { Jimp } from "jimp";
import { NextRequest } from "next/server";
import Tesseract from "tesseract.js";

const extractCnicNumber = (ocrText: string) => {
  // It has the format "12345-1234567-1"
  const cnicRegex = /\b\d{5}-\d{7}-\d\b/;

  // Extract any 13 digit number that might be a CNIC
  const cnicRegex2 = /\b\d{13}\b/; // Uncomment this line if you want to match a 13-digit CNIC without hyphens
  const match = ocrText.match(cnicRegex);
  // Remove the hyphen from the CNIC number
  const match2 = ocrText.match(cnicRegex2);
  if (match) {
    return match[0].replace(/-/g, ""); // Remove hyphens
  }

  if (match2) {
    return match2[0]; // Return the 13-digit CNIC number
  }
  return null;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const frontCnic = formData.get("frontCnic") as File;
    const backCnic = formData.get("backCnic") as File;

    console.log("Received files:", {
      frontCnic: frontCnic?.name,
      backCnic: backCnic?.name,
      frontCnicSize: frontCnic?.size,
      backCnicSize: backCnic?.size,
    });

    if (!frontCnic || !backCnic) {
      return new Response(
        JSON.stringify({
          error: "Both front and back CNIC images are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert File objects to Buffer for Tesseract
    const frontBuffer = Buffer.from(await frontCnic.arrayBuffer());
    const backBuffer = Buffer.from(await backCnic.arrayBuffer());

    const frontImage = await Jimp.read(frontBuffer);
    const backImage = await Jimp.read(backBuffer);

    frontImage.greyscale();
    backImage.greyscale();

    const threshold = 220; // Adjust this value (0-255) to control sensitivity

    frontImage.scan(
      0,
      0,
      frontImage.bitmap.width,
      frontImage.bitmap.height,
      function (x, y, idx) {
        // Get the red channel value (same as green and blue in grayscale)
        const grey = frontImage.bitmap.data[idx];

        // If pixel is darker than threshold, make it black, otherwise white
        if (grey < threshold) {
          frontImage.bitmap.data[idx] = 0; // Red
          frontImage.bitmap.data[idx + 1] = 0; // Green
          frontImage.bitmap.data[idx + 2] = 0; // Blue
        } else {
          frontImage.bitmap.data[idx] = 255; // Red
          frontImage.bitmap.data[idx + 1] = 255; // Green
          frontImage.bitmap.data[idx + 2] = 255; // Blue
        }
        // Alpha channel (idx + 3) remains unchanged
      }
    );

    backImage.scan(
      0,
      0,
      backImage.bitmap.width,
      backImage.bitmap.height,
      function (x, y, idx) {
        const grey = backImage.bitmap.data[idx];

        if (grey < threshold) {
          backImage.bitmap.data[idx] = 0; // Red
          backImage.bitmap.data[idx + 1] = 0; // Green
          backImage.bitmap.data[idx + 2] = 0; // Blue
        } else {
          backImage.bitmap.data[idx] = 255; // Red
          backImage.bitmap.data[idx + 1] = 255; // Green
          backImage.bitmap.data[idx + 2] = 255; // Blue
        }
      }
    );

    const workerFront = await Tesseract.createWorker("eng");
    const workerBack = await Tesseract.createWorker("eng");
    const [frontText, backText] = await Promise.all([
      workerFront.recognize(frontBuffer),
      workerBack.recognize(backBuffer),
    ]);

    // Clean up workers
    await workerFront.terminate();
    await workerBack.terminate();

    console.log("Front CNIC OCR Text:", frontText.data.text);
    console.log("Back CNIC OCR Text:", backText.data.text);

    const frontCnicNumber = extractCnicNumber(frontText.data.text);
    const backCnicNumber = extractCnicNumber(backText.data.text);

    console.log("Extracted Front CNIC Number:", frontCnicNumber);
    console.log("Extracted Back CNIC Number:", backCnicNumber);

    if (!frontCnicNumber || !backCnicNumber) {
      return new Response(
        JSON.stringify({
          error: "Failed to extract CNIC numbers from the images.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (frontCnicNumber === backCnicNumber) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "CNIC numbers match.",
          frontCnicNumber,
          backCnicNumber,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: "CNIC numbers do not match.",
          frontCnicNumber,
          backCnicNumber,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing CNIC validation:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error during CNIC validation.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
