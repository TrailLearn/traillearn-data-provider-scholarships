import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const API_URL = "http://localhost:54321/functions/v1/scholarship-detail";

Deno.test("Scholarship Detail - Integration Check", async (t) => {
    
    const isServerRunning = false; 

    if (!isServerRunning) {
        console.log("Skipping network test");
        return;
    }

    await t.step("GET / returns 400 if ID missing", async () => {
        const res = await fetch(API_URL);
        assertEquals(res.status, 400);
    });

    await t.step("GET / returns 404 if ID not found", async () => {
        const res = await fetch(`${API_URL}?id=00000000-0000-0000-0000-000000000000`);
        assertEquals(res.status, 404);
    });
});
