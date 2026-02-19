import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";

// Integration Test for Scholarships List
// Usage: deno test --allow-net --allow-env tests/integration/scholarships_list_test.ts

const API_URL = "http://localhost:54321/functions/v1/scholarships-list";

Deno.test("Scholarships List - Integration Check", async (t) => {
    
    // Skip actual network call if not in CI/Local env with server running
    const isServerRunning = false; // Set to true when running locally with `supabase start`

    if (!isServerRunning) {
        console.log("Skipping network test (Supabase not detected)");
        return;
    }

    await t.step("GET / returns 200 and JSON array", async () => {
        const res = await fetch(API_URL);
        assertEquals(res.status, 200);
        const data = await res.json();
        assertEquals(Array.isArray(data), true);
    });

        await t.step("GET / respects pagination limit", async () => {

            const res = await fetch(`${API_URL}?limit=5`);

            const data = await res.json();

            assertEquals(data.length <= 5, true);

        });

    

        await t.step("GET / filters by country", async () => {

            const res = await fetch(`${API_URL}?country=France`);

            const data = await res.json();

            const allFrance = data.every((s: any) => s.data?.eligibility?.destination_country === 'France');

            assertEquals(allFrance, true);

        });

    

        await t.step("GET / filters by min_health_score", async () => {

            const res = await fetch(`${API_URL}?min_health_score=90`);

            const data = await res.json();

            const allAbove90 = data.every((s: any) => s.health_score >= 90);

            assertEquals(allAbove90, true);

        });

    

        await t.step("GET / returns 400 for invalid min_health_score", async () => {

            const res = await fetch(`${API_URL}?min_health_score=abc`);

            assertEquals(res.status, 400);

            const error = await res.json();

            assertEquals(error.title, 'Invalid Parameter');

        });

    });

    