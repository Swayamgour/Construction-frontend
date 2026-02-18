import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    useGetAttendanceQuery,
    usePunchInMutation,
    useUserDetailQuery,
    useGetAttendanceByDateQuery
} from "../../Reduxe/Api";
import {
    Camera,
    User,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    LogOut
} from "lucide-react";

export default function PunchIn() {
    const navigate = useNavigate();
    const { data, isLoading: userLoading } = useUserDetailQuery();
    const [file, setFile] = useState(null);
    const [latLong, setLatLong] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [locationStatus, setLocationStatus] = useState("idle");
    const [punchIn, { isLoading }] = usePunchInMutation();
    const fileInputRef = useRef(null);




    // Handle file selection with preview
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
            setError(null);
        }
    };

    // Trigger camera capture
    const triggerCamera = () => {
        fileInputRef.current.click();
    };

    // Get live location
    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject("Geolocation not supported by your device");
                return;
            }

            setLocationStatus("fetching");

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocationStatus("success");
                    resolve({
                        latitude: pos.coords.latitude.toFixed(6),
                        longitude: pos.coords.longitude.toFixed(6),
                        accuracy: pos.coords.accuracy
                    });
                },
                (err) => {
                    setLocationStatus("error");
                    reject(err.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    // Format current time
    const getCurrentTime = () => {
        return new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Format current date
    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        (async () => {
            try {
                const loc = await getLocation();
                setLatLong(loc);
            } catch (err) {
                setError("Unable to get location");
            }
        })()
    }, []);


    // Submit punch-in
    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        if (!data?.user?._id) {
            setError("Employee information not available.");
            return;
        }

        if (!file) {
            setError("Please take a selfie.");
            return;
        }

        if (!latLong) {
            setError("Location not ready, wait a moment.");
            return;
        }

        try {
            const form = new FormData();
            form.append("employeeId", data.user._id);
            form.append("status", "Present");
            form.append("latitude", latLong.latitude);
            form.append("longitude", latLong.longitude);
            form.append("timestamp", new Date().toISOString());
            form.append("selfie", file);

            await punchIn(form).unwrap();

            setSuccess("Punch-in successful!");
            navigate(-1)
        } catch (err) {
            setError(err?.data?.message || "Error punching in");
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Attendance System</h1>
                        <p className="text-gray-600 mt-2">Mark your attendance with live location and selfie verification</p>
                    </div>

                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column: Employee Info & Selfie */}
                    <div className="space-y-6">
                        {/* Employee Card */}


                        {/* Selfie Capture */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-purple-100 p-3 rounded-xl">
                                    <Camera className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Selfie Verification</h2>
                                    <p className="text-gray-500 text-sm">Required for attendance</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Selfie Preview */}
                                <div className="relative bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 min-h-[200px] flex items-center justify-center overflow-hidden">
                                    {preview ? (
                                        <>
                                            <img
                                                src={preview}
                                                alt="Selfie preview"
                                                className="w-full h-auto max-h-64 object-contain rounded-lg"
                                            />
                                            <button
                                                onClick={() => {
                                                    setFile(null);
                                                    setPreview(null);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <Camera size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <Camera className="mx-auto text-gray-400" size={48} />
                                            <p className="text-gray-500 mt-3">No selfie captured</p>
                                            <p className="text-gray-400 text-sm">Click below to take a selfie</p>
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <button
                                    onClick={triggerCamera}
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    <Camera size={20} />
                                    {preview ? "Retake Selfie" : "Take Selfie"}
                                </button>

                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-blue-700 text-sm flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        <span>Please ensure your face is clearly visible in the selfie</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Location & Punch In */}
                    <div className="space-y-6">


                        {/* Location Status */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">


                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Status</span>
                                        <span className={`font-semibold ${locationStatus === "success" ? "text-green-600" :
                                            locationStatus === "fetching" ? "text-yellow-600" :
                                                locationStatus === "error" ? "text-red-600" : "text-gray-600"
                                            }`}>
                                            {locationStatus === "success" ? "Location Captured" :
                                                locationStatus === "fetching" ? "Fetching Location..." :
                                                    locationStatus === "error" ? "Location Error" : "Ready to Capture"}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        Your location will be automatically captured when you punch in
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                                    <p className="text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                    <p className="text-green-700">{success}</p>
                                </div>
                            </div>
                        )}

                        {/* Punch In Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !file || userLoading}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 ${isLoading || !file || userLoading
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={24} />
                                    Processing Punch In...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle size={24} />
                                    Punch In Now
                                </div>
                            )}
                        </button>

                        {/* Requirements Checklist */}

                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        <span className="font-medium">Note:</span> Your attendance is recorded with live GPS location and selfie verification for security purposes.
                    </p>
                </div>
            </div>
        </div>
    );
}