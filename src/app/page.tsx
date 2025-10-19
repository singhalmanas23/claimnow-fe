"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/use-auth";

interface resp {
  response: {
    data: {
      detail: string;
    };
  };
}

const slides = [
  {
    title: "Fast, AI-Powered Claim Extraction",
    subtitle:
      "Present how the platform uses advanced AI to instantly read medical bills and automatically extract all required claim details, saving significant manual effort and reducing errors.",
  },
  {
    title: "Real-Time Claim Adjudication",
    subtitle:
      "Showcase the immediate adjudication process, where users get clear results with allowed claim amounts, reasons for deductions, and a breakdown of claim components, building trust and clarity.",
  },
  {
    title: "Effortless Claim History & Tracking",
    subtitle:
      "Emphasize the streamlined dashboard where past claims are tracked, searchable, and filterable. Users can quickly find the status of their past submissions and download documents, all in one place.",
  },
];

export default function SignInPage() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string>("");

  // Auto-rotate slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username && password && agreedToTerms) {
      try {
        await loginMutation.mutateAsync({
          username: username,
          password: password,
        });

        // Redirect to upload page on success
        router.push("/upload");
      } catch (err: any) //eslint-disable-line @typescript-eslint/no-explicit-any
      {
        setError(
          err?.response?.data?.detail ||
            "Invalid credentials. Please try again."
        );
      }
    }
  };

  return (
    <div className="w-full h-screen bg-white flex">
      {/* Left Side - AI Feature Showcase */}
      <div className="flex-1 p-3 max-w-[760px]">
        <div className="w-full h-full bg-[#EBEBEB] rounded-[24px] relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 -top-5">
            <Image
              src="/claim-extraction-image.png"
              alt="AI Claim Extraction"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end items-center pb-20 px-14">
            <div className="text-center text-white">
              {/* Title with fade transition */}
              <h2 className="font-poppins font-medium text-[28px] leading-[28px] text-center mb-6 transition-opacity duration-500">
                {slides[activeIndex].title}
              </h2>

              {/* Subtitle with fade transition */}
              <p className="font-poppins font-normal text-base leading-6 text-center opacity-80 mb-20 max-w-[634px] transition-opacity duration-500">
                {slides[activeIndex].subtitle}
              </p>

              {/* Progress Indicators */}
              <div className="flex items-center justify-center gap-[6px]">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`transition-all duration-300 cursor-pointer ${
                      activeIndex === i
                        ? "w-[43px] h-2 bg-white rounded-[20px]"
                        : "w-2 h-2 bg-white opacity-50 rounded-[20px]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-[472px] flex flex-col justify-center px-12">
        <div className="w-full max-w-[424px]">
          <h1 className="font-poppins font-semibold text-[32px] leading-[48px] text-[#1D2433] mb-8">
            Welcome! Sign In
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Username Input */}
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full h-14 px-5 font-poppins font-normal text-sm leading-[21px] placeholder:text-[rgba(29,36,51,0.65)] text-[#1D2433] border border-[#D8DDE7] rounded-lg focus:outline-none focus:border-[#2F5FED] focus:ring-1 focus:ring-[#2F5FED] transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-14 px-5 font-poppins font-normal text-sm leading-[21px] placeholder:text-[rgba(29,36,51,0.65)] text-[#1D2433] border border-[#D8DDE7] rounded-lg focus:outline-none focus:border-[#2F5FED] focus:ring-1 focus:ring-[#2F5FED] transition-all"
              />
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-center gap-3 py-1">
              <div
                className={`w-6 h-6 rounded cursor-pointer flex items-center justify-center ${
                  agreedToTerms
                    ? "bg-gradient-to-br from-[#2F5FED] to-[#5D86FF]"
                    : "bg-white border border-[#D8DDE7]"
                }`}
                onClick={() => setAgreedToTerms(!agreedToTerms)}
              >
                {agreedToTerms && (
                  <svg
                    width="11"
                    height="8"
                    viewBox="0 0 11 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                  >
                    <path
                      d="M1.5 4L4 6.5L9.5 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <label
                className="font-poppins font-normal text-sm leading-[21px] text-black cursor-pointer"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
              >
                I agree to Terms & Conditions
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={
                !username ||
                !password ||
                !agreedToTerms ||
                loginMutation.isPending
              }
              className={`w-full h-14 border border-[#D8DDE7] rounded-lg font-poppins font-medium text-sm leading-[21px] transition-colors ${
                username &&
                password &&
                agreedToTerms &&
                !loginMutation.isPending
                  ? "bg-gradient-to-br from-[#2F5FED] to-[#5D86FF] text-white border-transparent hover:from-[#2854D6] hover:to-[#4B7AE8]"
                  : "bg-[#F1F3F9] text-[rgba(29,36,51,0.65)] cursor-not-allowed"
              }`}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
