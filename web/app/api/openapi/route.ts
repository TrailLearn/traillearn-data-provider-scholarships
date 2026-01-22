import { NextResponse } from 'next/server';
import openapiBase from '@/public/openapi.json';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Clone the base spec
  const spec = { ...openapiBase };

  // Dynamically update servers based on environment
  if (supabaseUrl) {
    spec.servers = [
      {
        url: `${supabaseUrl}/functions/v1`,
        description: "Environment API"
      },
      ...openapiBase.servers.filter(s => s.description !== "Production API")
    ];
  }

  return NextResponse.json(spec);
}
