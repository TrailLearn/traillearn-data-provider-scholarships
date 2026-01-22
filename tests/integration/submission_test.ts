import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const API_URL = "http://localhost:54321/functions/v1/scholarship-submission";

Deno.test("Submission API - Integration Check", async (t) => {
    const isServerRunning = false; // Toggle locally

    if (!isServerRunning) {
        console.log("Skipping network test");
        return;
    }

    await t.step("POST without token returns 401", async () => {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ name: 'Test' })
        });
        assertEquals(res.status, 401);
    });

    await t.step("POST with invalid token returns 401", async () => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer invalid-token' },
            body: JSON.stringify({ name: 'Test' })
        });
        assertEquals(res.status, 401);
    });

    // Note: Success tests (201) and Validation errors (400) require authentication
    // which is usually handled in CI by creating a service-role session.
});
