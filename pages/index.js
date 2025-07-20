import { useState } from 'react';
import { Upload, User, CreditCard, Shield, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

export default function Home() {
  const [selfie, setSelfie] = useState(null);
  const [cnicfront, setCnicFront] = useState(null);
  const [cnicback, setCnicBack] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detailedResult, setDetailedResult] = useState(null);

  const handleFileUpload = (file, setFile) => {
    if (file && file.type.startsWith('image/')) {
      setFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selfie || !cnicfront || !cnicback) {
      setResult('Please upload all required images.');
      setDetailedResult(null);
      return;
    }

    const formData = new FormData();
    formData.append('selfie', selfie);
    formData.append('cnicfront', cnicfront);
    formData.append('cnicback', cnicback);

    setIsLoading(true);
    setResult('Verifying your identity...');
    setDetailedResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log("API response:", data);

      setDetailedResult(data);

      if (data.error) {
        setResult(`Verification failed: ${data.error}`);
      } else if (data.overallMatch) {
        setResult('Identity Successfully Verified!');
      } else {
        setResult('Identity Verification Failed');
      }
    } catch (error) {
      setResult('Network error. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadCard = ({ label, file, setFile, icon: Icon, accept = "image/*" }) => (
    <div className="relative group">
      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
        file 
          ? 'border-green-300 bg-green-50' 
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
      }`}>
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileUpload(e.target.files[0], setFile)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center space-y-3">
          <div className={`p-3 rounded-full ${file ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
            <Icon className={`w-6 h-6 ${file ? 'text-green-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
          </div>
          <div>
            <p className={`font-medium ${file ? 'text-green-700' : 'text-gray-700'}`}>
              {label}
            </p>
            {file ? (
              <p className="text-sm text-green-600 mt-1">✓ {file.name}</p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Click to upload or drag & drop</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const getResultIcon = () => {
    if (isLoading) return <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    if (!detailedResult) return <AlertCircle className="w-6 h-6 text-amber-500" />;
    if (detailedResult.overallMatch) return <CheckCircle className="w-6 h-6 text-green-500" />;
    return <XCircle className="w-6 h-6 text-red-500" />;
  };

  const getResultColor = () => {
    if (isLoading) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (!detailedResult) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (detailedResult.overallMatch) return 'text-green-700 bg-green-50 border-green-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Identity Verification</h1>
          <p className="text-gray-600 text-lg">Secure and instant verification using AI technology</p>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Upload Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <FileUploadCard
                label="Upload Selfie"
                file={selfie}
                setFile={setSelfie}
                icon={User}
              />
              <FileUploadCard
                label="CNIC Front"
                file={cnicfront}
                setFile={setCnicFront}
                icon={CreditCard}
              />
              <FileUploadCard
                label="CNIC Back"
                file={cnicback}
                setFile={setCnicBack}
                icon={CreditCard}
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading || !selfie || !cnicfront || !cnicback}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5 mr-2" />
                    Verify Identity
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results Section */}
          {result && (
            <div className="mt-12">
              <div className={`rounded-xl border-2 p-6 ${getResultColor()}`}>
                <div className="flex items-center justify-center mb-4">
                  {getResultIcon()}
                  <h3 className="text-xl font-semibold ml-3">{result}</h3>
                </div>

                {/* Detailed Results */}
                {detailedResult && !detailedResult.error && (
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Face Match Results */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Face Verification
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`font-medium ${detailedResult.faceMatch?.match ? 'text-green-600' : 'text-red-600'}`}>
                            {detailedResult.faceMatch?.match ? 'Matched' : 'Not Matched'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">
                            {detailedResult.faceMatch?.distance ? 
                              `${Math.round((1 - detailedResult.faceMatch.distance) * 100)}%` : 
                              'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CNIC Match Results */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        CNIC Verification
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`font-medium ${detailedResult.cnicMatch?.match ? 'text-green-600' : 'text-red-600'}`}>
                            {detailedResult.cnicMatch?.status || 'Unknown'}
                          </span>
                        </div>
                        {detailedResult.cnicMatch?.frontPattern && detailedResult.cnicMatch.frontPattern !== 'Pattern not found' && (
                          <div className="flex justify-between">
                            <span>CNIC Number:</span>
                            <span className="font-mono text-xs">
                              {detailedResult.cnicMatch.frontPattern}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-sm">
              Your images are processed securely and are not stored on our servers. 
              All verification happens in real-time and your data is immediately discarded after processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}