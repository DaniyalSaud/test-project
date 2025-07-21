"use client";
import { isValidNumber } from "face-api.js/build/commonjs/utils";
import { useState } from "react";
import * as faceapi from "face-api.js";
import { loadModels, getFaceDescriptor, getLabelledFaceDescriptors } from "@/utils/FaceDetection";


export default function Home() {
  const [frontCnic, setFrontCnic] = useState<File | null>(null);
  const [backCnic, setBackCnic] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setter(file);
    }
  };

  const handleValidate = async () => {
    if (!frontCnic || !backCnic || !selfie) {
      alert("Please upload all required images before validating.");
      return;
    }

    setIsValidating(true);
    setValidationResult(null); // Clear previous results

    try {
      const formData = new FormData();
      formData.append("frontCnic", frontCnic);
      formData.append("backCnic", backCnic);
      formData.append("selfie", selfie);

      const response = await fetch("/api/verify", { 
        method: "POST", 
        body: formData 
      });

      const result = await response.json();
      console.log("Response from verification API:", result);

      if (response.ok && result.success) {
        setValidationResult(`✅ CNIC validation successful! Numbers match: ${result.frontCnicNumber}`);
        
        // If CNIC validation passes, proceed with face matching
        // await loadModels(); // Ensure models are loaded before validation
        // const frontDescriptor = await getFaceDescriptor(frontCnic);
        // const selfieLabelledFaceDescriptors = await getLabelledFaceDescriptors(selfie);
        // const maxDescriptorDistance = 0.6; // Adjust this threshold as needed
        // const faceMatcher = new faceapi.FaceMatcher(selfieLabelledFaceDescriptors, maxDescriptorDistance);
        // const faceMatchResult = faceMatcher.findBestMatch(frontDescriptor);
        
      } else {
        setValidationResult(`❌ ${result.error || 'Validation failed'}`);
      }
      
    } catch (error) {
      setValidationResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="font-sans p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Document Upload & Validation
      </h1>

      <div className="space-y-6">
        {/* Front CNIC Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <label
            htmlFor="front-cnic"
            className="block text-lg font-medium mb-4"
          >
            Front CNIC Image
          </label>
          <input
            id="front-cnic"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setFrontCnic)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {frontCnic && (
            <p className="mt-2 text-green-600 text-sm">
              ✓ {frontCnic.name} uploaded
            </p>
          )}
        </div>

        {/* Back CNIC Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <label htmlFor="back-cnic" className="block text-lg font-medium mb-4">
            Back CNIC Image
          </label>
          <input
            id="back-cnic"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setBackCnic)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {backCnic && (
            <p className="mt-2 text-green-600 text-sm">
              ✓ {backCnic.name} uploaded
            </p>
          )}
        </div>

        {/* Selfie Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <label htmlFor="selfie" className="block text-lg font-medium mb-4">
            Selfie Image
          </label>
          <input
            id="selfie"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setSelfie)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selfie && (
            <p className="mt-2 text-green-600 text-sm">
              ✓ {selfie.name} uploaded
            </p>
          )}
        </div>

        {/* Validate Button */}
        <button
          onClick={handleValidate}
          className={`w-full ${
            isValidating ? "bg-blue-400" : "bg-blue-600"
          } hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 mt-8`}
          disabled={isValidating}
        >
          {isValidating ? "Validating" : "Validate Images"}
        </button>

        {/* Validation Result */}
        {validationResult && (
          <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800">
              Validation Result
            </h2>
            <p className="text-sm text-green-700 mt-2">{validationResult.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
