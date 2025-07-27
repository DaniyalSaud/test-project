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
  
  // Additional form fields state
  const [name, setName] = useState<string>("");
  const [fatherName, setFatherName] = useState<string>("");
  const [cnicNumber, setCnicNumber] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [cnicExpiryDate, setCnicExpiryDate] = useState<string>("");

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
      formData.append("front_image", frontCnic);
      formData.append("back_image", backCnic);

      const response = await fetch("http://127.0.0.1:5000/extract-cnic", { 
        method: "POST", 
        body: formData 
      });

      const result = await response.json();
      console.log("Response from verification API:", result);

      if (response.ok && result.success) {
        setName(result.extracted_data['Name']);
        setFatherName(result.extracted_data['Father Name']);
        setCnicNumber(result.extracted_data['Identity Number']);
        setCountry(result.extracted_data['Country of Stay']);
        setDateOfBirth(result.extracted_data['Date of Birth'].split('.').reverse().join('-')); // Convert from DD.MM.YYYY to YYYY-MM-DD format
        setCnicExpiryDate(result.extracted_data['Date of Expiry'].split('.').reverse().join('-')); // Convert from DD.MM.YYYY to YYYY-MM-DD format
        if (result.extracted_data['Gender'] === "M"){
          setGender('Male');
        }else if (result.extracted_data['Gender'] === "F"){
          setGender("Female");
        }
        setValidationResult(`✅ CNIC validation successful! Numbers match: ${result.frontCnicNumber}`);
        return;

        // If CNIC validation passes, proceed with face matching
        await loadModels(); // Ensure models are loaded before validation
        const frontDescriptor = await getFaceDescriptor(frontCnic);
        const selfieLabelledFaceDescriptors = await getLabelledFaceDescriptors(selfie);
        const maxDescriptorDistance = 0.6; // Adjust this threshold as needed
        const faceMatcher = new faceapi.FaceMatcher(selfieLabelledFaceDescriptors, maxDescriptorDistance);
        const faceMatchResult = faceMatcher.findBestMatch(frontDescriptor);
        
        setValidationResult(faceMatchResult.toString());
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
    <div className="font-sans p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Document Upload & Validation
      </h1>

      <div className="space-y-8">
        {/* Image Upload Section - 3 images in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Front CNIC Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label
              htmlFor="front-cnic"
              className="block text-lg font-medium mb-4 text-center"
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
              <p className="mt-2 text-green-600 text-sm text-center">
                ✓ {frontCnic.name} uploaded
              </p>
            )}
          </div>

          {/* Back CNIC Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label htmlFor="back-cnic" className="block text-lg font-medium mb-4 text-center">
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
              <p className="mt-2 text-green-600 text-sm text-center">
                ✓ {backCnic.name} uploaded
              </p>
            )}
          </div>

          {/* Selfie Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label htmlFor="selfie" className="block text-lg font-medium mb-4 text-center">
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
              <p className="mt-2 text-green-600 text-sm text-center">
                ✓ {selfie.name} uploaded
              </p>
            )}
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Father Name */}
            <div>
              <label htmlFor="father-name" className="block text-sm font-medium text-gray-700 mb-2">
                Father's Name *
              </label>
              <input
                id="father-name"
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter father's name"
                required
              />
            </div>

            {/* CNIC Number */}
            <div>
              <label htmlFor="cnic-number" className="block text-sm font-medium text-gray-700 mb-2">
                CNIC Number *
              </label>
              <input
                id="cnic-number"
                type="text"
                value={cnicNumber}
                onChange={(e) => setCnicNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="xxxxx-xxxxxxx-x"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your country"
                required
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your city"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date-of-birth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                id="date-of-birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* CNIC Expiry Date */}
            <div>
              <label htmlFor="cnic-expiry" className="block text-sm font-medium text-gray-700 mb-2">
                CNIC Expiry Date *
              </label>
              <input
                id="cnic-expiry"
                type="date"
                value={cnicExpiryDate}
                onChange={(e) => setCnicExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Address - Full Width */}
          <div className="mt-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your complete address"
              required
            />
          </div>
        </div>

        {/* Validate Button */}
        <button
          onClick={handleValidate}
          className={`w-full ${
            isValidating ? "bg-blue-400" : "bg-blue-600"
          } hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200`}
          disabled={isValidating}
        >
          {isValidating ? "Validating..." : "Validate Information"}
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
