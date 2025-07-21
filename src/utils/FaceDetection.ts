import * as faceapi from "face-api.js";


let isModelLoaded = false;
export const loadModels = async () => {
  if (isModelLoaded) return;

  try {
    // Load the models from the public directory
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    isModelLoaded = true;
    console.log("Models loaded successfully");
  } catch (error) {
    console.error("Error loading models:", error);
  }
}

export const getFaceDescriptor = async (face: File) => {
  const selfieUrl = URL.createObjectURL(face);

  const img = await faceapi.fetchImage(selfieUrl);
  const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  console.log("Face Descriptor Detections:", detections);
  if (!detections) {
    throw new Error("No valid face detected in the image.");
  }

  return detections.descriptor;
}

export const getLabelledFaceDescriptors = async (selfie: File) => {
  const selfieUrl = URL.createObjectURL(selfie);
  const img = await faceapi.fetchImage(selfieUrl);

  const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  if (!detections) {
    throw new Error("No valid face detected in the selfie.");
  }

  const faceDescriptor = detections.descriptor;
  const labelledFaceDescriptors = new faceapi.LabeledFaceDescriptors("user", [faceDescriptor]);

  return labelledFaceDescriptors;
}