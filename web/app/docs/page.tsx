"use client";

import dynamic from 'next/dynamic';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import "swagger-ui-react/swagger-ui.css";

// Dynamic import to avoid SSR issues with Swagger UI
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    )
});

export default function ApiDocsPage() {
  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 custom-swagger-container">
        <style jsx global>{`
          .custom-swagger-container .swagger-ui {
            padding: 2rem;
          }
          .custom-swagger-container .swagger-ui .info {
            margin: 0 0 2rem 0;
          }
          /* Dark mode adjustments for Swagger if needed */
          .dark .custom-swagger-container .swagger-ui {
            filter: invert(88%) hue-rotate(180deg);
          }
        `}</style>
        <SwaggerUI 
          url="/api/openapi" 
          requestSnippetsEnabled={true}
          displayOperationId={false}
          defaultModelsExpandDepth={-1}
        />
      </div>
    </DashboardLayout>
  );
}