"use client";

import dynamic from 'next/dynamic';
import "swagger-ui-react/swagger-ui.css";

// Dynamic import to avoid SSR issues with Swagger UI
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="bg-white h-screen overflow-auto">
      <SwaggerUI url="/openapi.json" />
    </div>
  );
}
