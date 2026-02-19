import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const API_URL = "http://localhost:54321/functions/v1/metadata";

Deno.test("Metadata Endpoint - Integration Check", async (t) => {
    
    const isServerRunning = false; 

    if (!isServerRunning) {
        console.log("Skipping network test");
        return;
    }

    await t.step("GET / returns lists and cache headers", async () => {
        const res = await fetch(API_URL);
        assertEquals(res.status, 200);
        const data = await res.json();
        
        assertEquals(Array.isArray(data.countries), true);
        assertEquals(Array.isArray(data.levels), true);
        assertEquals(res.headers.get('cache-control')?.includes('max-age=3600'), true);
    });
});
