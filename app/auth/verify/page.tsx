"use client";
export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import VerifyContent from "./VerifyContent";

// ✅ Wrap in Suspense boundary for useSearchParams()
export default function VerifyPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center text-gray-400">
          Loading verification page...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
