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

    // Note: To test success, we would need a valid JWT from a local user.
    // This is typically done by signing up a test user in the setup phase.
});
