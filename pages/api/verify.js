// pages/api/verify.js

import fs from "fs";
import path from "path";
import * as tf from "@tensorflow/tfjs-node";
import * as faceapi from "@vladmandic/face-api";
import formidable from "formidable";
import Tesseract from 'tesseract.js';
import sharp from 'sharp'; // Add sharp for image processing

export const config = {
  api: {
    bodyParser: false,
  },
};

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  const modelPath = path.join(process.cwd(), "models");
  console.log("Loading models from:", modelPath);
  await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  modelsLoaded = true;
}

async function getDescriptor(tensor) {
  const detection = await faceapi
    .detectSingleFace(
      tensor,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.2,
      })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  tensor.dispose();

  return detection ? detection.descriptor : null;
}

/**
 * Process CNIC back image with specific adjustments
 * @param {string} imagePath - Path to the original image
 * @returns {Promise<string>} - Path to the processed image
 */
async function processCNICBackImage(imagePath) {
  try {
    console.log('Processing CNIC back image with adjustments...');
    
    // Create processed image path - handle temp files without extensions
    let processedImagePath;
    if (imagePath.includes('.')) {
      processedImagePath = imagePath.replace(/(\.[^.]+)$/, '_processed$1');
    } else {
      // For temp files without extensions, add suffix and .png extension for better quality
      processedImagePath = imagePath + '_processed.png';
    }
    
    console.log('Original image path:', imagePath);
    console.log('Processed image path:', processedImagePath);
    
    // Get image metadata to determine processing approach
    const metadata = await sharp(imagePath).metadata();
    console.log('Image metadata:', { width: metadata.width, height: metadata.height, format: metadata.format });
    
    // Apply enhanced image processing for better OCR
    await sharp(imagePath)
      // First, resize if image is too large for better processing
      .resize(Math.min(metadata.width * 2, 3000), Math.min(metadata.height * 2, 3000), {
        fit: 'inside',
        withoutEnlargement: false
      })
      // Convert to grayscale first (saturation = -100%)
      .grayscale()
      // Enhance contrast significantly
      .normalize() // Auto-enhance contrast based on image histogram
      .linear(1.5, 30) // Additional contrast boost with brightness offset
      // Apply gamma correction to brighten midtones - FIXED: changed from 0.8 to 1.2
      .gamma(1.2)
      // Sharpen the image to make text clearer - FIXED: using correct Sharp API parameters
      .sharpen({
        sigma: 1.5,
        flat: 1.0,
        jagged: 2.0
      })
      // Save as PNG for lossless quality
      .png({ quality: 100, compressionLevel: 0 })
      .toFile(processedImagePath);
    
    console.log('Enhanced image processing completed, saved to:', processedImagePath);
    return processedImagePath;
    
  } catch (error) {
    console.error('Error processing CNIC back image:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Extract text from image using OCR
 * @param {string} imagePath - Path to the image file
 * @param {boolean} isBackImage - Whether this is CNIC back image (needs QR filtering)
 * @returns {Promise<string>} - Extracted text from the image
 */
async function extractTextFromImage(imagePath, isBackImage = false) {
  try {
    console.log(`Starting OCR for: ${imagePath} (Back image: ${isBackImage})`);
    
    let finalImagePath = imagePath;
    
    // If it's a back image, process it first
    if (isBackImage) {
      finalImagePath = await processCNICBackImage(imagePath);
    }
    
    // Enhanced OCR options for better text recognition
    const ocrOptions = {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    };
    
    if (isBackImage) {
      // More aggressive settings for back image with QR code
      ocrOptions.tessedit_pageseg_mode = Tesseract.PSM.AUTO; // Changed from SPARSE_TEXT to AUTO
      ocrOptions.tessedit_ocr_engine_mode = Tesseract.OEM.LSTM_ONLY; // Use LSTM engine
      // Allow more characters for back image since it contains more text
      ocrOptions.tessedit_char_whitelist = '0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .:,/()';
      // Additional Tesseract parameters for better recognition
      ocrOptions.preserve_interword_spaces = '1';
      ocrOptions.user_defined_dpi = '300';
    } else {
      // Front image settings - focus on CNIC number
      ocrOptions.tessedit_pageseg_mode = Tesseract.PSM.AUTO;
      ocrOptions.tessedit_char_whitelist = '0123456789-';
      ocrOptions.user_defined_dpi = '300';
    }
    
    console.log('OCR Options:', ocrOptions);
    
    const { data: { text } } = await Tesseract.recognize(finalImagePath, 'eng', ocrOptions);
    console.log(`OCR completed for: ${finalImagePath}`);
    console.log(`Extracted text length: ${text.length} characters`);
    console.log(`First 200 characters: ${text.substring(0, 200)}`);
    
    // Clean up processed image file
    if (isBackImage && finalImagePath !== imagePath) {
      try {
        fs.unlinkSync(finalImagePath);
        console.log('Cleaned up processed image file');
      } catch (cleanupError) {
        console.warn('Could not clean up processed image:', cleanupError.message);
      }
    }
    
    return text;
  } catch (error) {
    console.error(`OCR Error for ${imagePath}:`, error);
    throw new Error(`Failed to extract text from image: ${imagePath}`);
  }
}

/**
 * Find CNIC pattern XXXXX-XXXXXXX-X in text
 * @param {string} text - Text to search in
 * @param {boolean} isBackImage - Whether this is from CNIC back image (has QR code interference)
 * @returns {string|null} - Found CNIC pattern or null if not found
 */
function findCNICPattern(text, isBackImage = false) {
  // Pakistani CNIC pattern: 5 digits - 7 digits - 1 digit
  const cnicRegex = /\d{5}-\d{7}-\d{1}/g;
  
  // Clean text and remove extra spaces/newlines
  let cleanText = text.replace(/\s+/g, ' ').trim();
  
  console.log(`Searching for CNIC pattern in ${isBackImage ? 'back' : 'front'} image text:`, 
              cleanText.substring(0, 300) + (cleanText.length > 300 ? '...' : ''));
  
  // For back images, apply more aggressive filtering
  if (isBackImage) {
    // Remove common QR code artifacts and noise
    cleanText = cleanText
      .replace(/[^\d\s\-A-Za-z.:,/()]/g, ' ') // Remove special characters except common ones
      .replace(/[A-Za-z]{15,}/g, ' ') // Remove very long letter sequences (QR code data)
      .replace(/\b[A-Z]{10,}\b/g, ' ') // Remove long uppercase sequences
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    console.log('Cleaned back image text (QR filtered):', 
                cleanText.substring(0, 300) + (cleanText.length > 300 ? '...' : ''));
  }
  
  // First try: exact CNIC pattern
  const matches = cleanText.match(cnicRegex);
  if (matches && matches.length > 0) {
    console.log('Found exact CNIC patterns:', matches);
    return matches[0]; // Return first match
  }
  
  // Second try: look for patterns with potential OCR errors or spacing
  const relaxedRegex = /[\d\s]{4,7}[-\s]+[\d\s]{6,9}[-\s]+[\d\s]{1,3}/g;
  const relaxedMatches = cleanText.match(relaxedRegex);
  if (relaxedMatches) {
    console.log('Found potential CNIC patterns (with OCR errors):', relaxedMatches);
    
    // Try to clean up each match
    for (const match of relaxedMatches) {
      // Remove all spaces and normalize dashes
      let cleaned = match.replace(/\s+/g, '').replace(/-+/g, '-');
      
      // Try to fix common OCR errors
      cleaned = cleaned
        .replace(/[O]/g, '0') // O -> 0
        .replace(/[I|l]/g, '1') // I, l -> 1
        .replace(/[S]/g, '5'); // S -> 5
      
      console.log('Attempting to clean pattern:', match, '->', cleaned);
      
      // Check if cleaned version matches exact CNIC format
      if (/^\d{5}-\d{7}-\d{1}$/.test(cleaned)) {
        console.log('Successfully cleaned pattern:', cleaned);
        return cleaned;
      }
      
      // Try to reconstruct if pattern is close
      const digitsOnly = cleaned.replace(/[^0-9]/g, '');
      if (digitsOnly.length === 13) {
        const reconstructed = `${digitsOnly.substring(0,5)}-${digitsOnly.substring(5,12)}-${digitsOnly.substring(12)}`;
        console.log('Reconstructed pattern from digits:', reconstructed);
        return reconstructed;
      }
    }
  }
  
  // Third try: look for any 13-digit sequence that could be a CNIC
  const digitSequence = cleanText.replace(/[^0-9]/g, '');
  console.log('All digits found:', digitSequence);
  
  if (digitSequence.length >= 13) {
    // Try to find a 13-digit sequence
    for (let i = 0; i <= digitSequence.length - 13; i++) {
      const potential = digitSequence.substring(i, i + 13);
      const formatted = `${potential.substring(0,5)}-${potential.substring(5,12)}-${potential.substring(12)}`;
      console.log(`Potential CNIC from position ${i}:`, formatted);
      return formatted;
    }
  }
  
  console.log('No CNIC pattern found in text');
  return null;
}

/**
 * Compare CNIC patterns between front and back images
 * @param {string} frontImagePath - Path to CNIC front image
 * @param {string} backImagePath - Path to CNIC back image
 * @returns {Promise<Object>} - Result object with match status and patterns
 */
async function compareCNICPatterns(frontImagePath, backImagePath) {
  try {
    console.log('Starting CNIC pattern comparison...');
    
    // Extract text from both images with appropriate settings
    console.log('Processing CNIC front image...');
    const frontText = await extractTextFromImage(frontImagePath, false);
    const frontPattern = findCNICPattern(frontText, false);
    
    console.log('Processing CNIC back image (with QR code filtering and image adjustments)...');
    const backText = await extractTextFromImage(backImagePath, true);
    const backPattern = findCNICPattern(backText, true);
    
    console.log('CNIC Pattern Results:', {
      front: frontPattern,
      back: backPattern
    });
    
    // Check if both patterns exist and match
    const isMatched = frontPattern && backPattern && frontPattern === backPattern;
    
    return {
      matched: isMatched,
      status: isMatched ? 'MATCHED' : 'NOT MATCHED',
      frontPattern: frontPattern || 'Pattern not found',
      backPattern: backPattern || 'Pattern not found',
      frontText: frontText.substring(0, 500), // First 500 chars for debugging
      backText: backText.substring(0, 500)
    };
    
  } catch (error) {
    console.error('Error comparing CNIC patterns:', error);
    return {
      matched: false,
      status: 'ERROR',
      error: error.message,
      frontPattern: null,
      backPattern: null
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await loadModels();

  const form = formidable({});
  
  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    if (
      !files.selfie ||
      !files.cnicfront ||
      !files.cnicback ||
      !Array.isArray(files.selfie) ||
      !Array.isArray(files.cnicfront) ||
      !Array.isArray(files.cnicback)
    ) {
      return res.status(400).json({
        error: "Selfie, CNIC front, and CNIC back images are required.",
      });
    }

    const selfiePath = files.selfie[0].filepath;
    const cnicfrontPath = files.cnicfront[0].filepath;
    const cnicbackPath = files.cnicback[0].filepath;

    // Face matching between selfie and CNIC front
    const tensorSelfie = tf.node.decodeImage(fs.readFileSync(selfiePath));
    const tensorCNIC = tf.node.decodeImage(fs.readFileSync(cnicfrontPath));

    const descriptorSelfie = await getDescriptor(tensorSelfie);
    const descriptorCNIC = await getDescriptor(tensorCNIC);

    if (!descriptorSelfie || !descriptorCNIC) {
      return res.status(400).json({
        error:
          "Could not detect faces in one or both images. Please ensure the photos are clear and contain a single visible face.",
      });
    }

    const distance = faceapi.euclideanDistance(
      descriptorSelfie,
      descriptorCNIC
    );
    const faceMatch = distance < 0.6; // Less strict threshold for ID photo comparison

    console.log(`Face Distance: ${distance}`);
    console.log(`Face Match: ${faceMatch}`);

    // CNIC pattern matching between front and back
    const cnicPatternResult = await compareCNICPatterns(cnicfrontPath, cnicbackPath);
    
    console.log('CNIC Pattern Matching Result:', cnicPatternResult);

    // Overall verification result
    const overallMatch = faceMatch && cnicPatternResult.matched;

    return res.status(200).json({
      overallMatch,
      faceMatch: {
        match: faceMatch,
        distance,
      },
      cnicMatch: {
        match: cnicPatternResult.matched,
        status: cnicPatternResult.status,
        frontPattern: cnicPatternResult.frontPattern,
        backPattern: cnicPatternResult.backPattern,
        error: cnicPatternResult.error || null
      },
      // Optional: Include extracted text for debugging (remove in production)
      debug: {
        frontText: cnicPatternResult.frontText,
        backText: cnicPatternResult.backText
      }
    });

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}