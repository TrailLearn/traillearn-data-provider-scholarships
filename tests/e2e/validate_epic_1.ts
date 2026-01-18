// Epic 1 E2E Validation Script
// Usage: deno run --allow-net tests/e2e/validate_epic_1.ts

import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const BASE_URL = "http://localhost:54321/functions/v1";

console.log("🚀 Starting Epic 1 E2E Validation...");

// 1. Metadata
console.log("\n[1] Testing Metadata Endpoint...");
try {
    const res = await fetch(`${BASE_URL}/metadata`);
    assertEquals(res.status, 200, "Metadata should return 200");
    const meta = await res.json();
    assertExists(meta.countries, "Should have countries");
    assertExists(meta.levels, "Should have levels");
    console.log("✅ Metadata OK");
} catch (e) {
    console.error("❌ Metadata Failed:", e.message);
}

// 2. List Scholarships
let firstId: string | null = null;

console.log("\n[2] Testing List Endpoint...");
try {
    const res = await fetch(`${BASE_URL}/scholarships-list`);
    assertEquals(res.status, 200, "List should return 200");
    const list = await res.json();
    assertEquals(Array.isArray(list), true, "Should return an array");
    console.log(`ℹ️ Found ${list.length} scholarships`);
    
    if (list.length > 0) {
        firstId = list[0].id;
        console.log("✅ List OK");
    } else {
        console.warn("⚠️ List empty - did you run seed.sql?");
    }
} catch (e) {
    console.error("❌ List Failed:", e.message);
}

// 3. Filters
console.log("\n[3] Testing Filters (France)...");
try {
    const res = await fetch(`${BASE_URL}/scholarships-list?country=France`);
    const list = await res.json();
    if (list.length > 0) {
        const isFrance = list[0].data?.eligibility?.destination_country === 'France';
        if (isFrance) console.log("✅ Filter Country OK");
        else console.error("❌ Filter Country Failed: Got non-France result");
    } else {
        console.warn("⚠️ No France scholarships found to test filter");
    }
} catch (e) {
    console.error("❌ Filter Failed:", e.message);
}

// 4. Detail
if (firstId) {
    console.log(`\n[4] Testing Detail Endpoint for ID: ${firstId}...`);
    try {
        // Try query param
        const res = await fetch(`${BASE_URL}/scholarship-detail?id=${firstId}`);
        assertEquals(res.status, 200, "Detail should return 200");
        const detail = await res.json();
        assertEquals(detail.id, firstId, "ID should match");
        console.log("✅ Detail OK");
    } catch (e) {
        console.error("❌ Detail Failed:", e.message);
    }
} else {
    console.warn("⏭️ Skipping Detail test (no ID available)");
}

console.log("\n🏁 Validation Complete.");
