// Unit Tests for Business Logic
// Executable with 'node tests/unit/logic_verification.js'

const assert = require('assert');

console.log("🧪 Running Unit Tests...");

// --- 1. Pagination Logic ---
function normalizePagination(limitInput, offsetInput) {
    const MAX_LIMIT = 100;
    let limit = parseInt(limitInput ?? '20');
    let offset = parseInt(offsetInput ?? '0');

    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    if (isNaN(offset) || offset < 0) offset = 0;

    return { limit, offset };
}

try {
    console.log("  Testing Pagination Logic...");
    
    // Default
    let res = normalizePagination(null, null);
    assert.strictEqual(res.limit, 20);
    assert.strictEqual(res.offset, 0);

    // Capping
    res = normalizePagination('1000', '0');
    assert.strictEqual(res.limit, 100);

    // Negative handling
    res = normalizePagination('-5', '-10');
    assert.strictEqual(res.limit, 20);
    assert.strictEqual(res.offset, 0);

    // Valid inputs
    res = normalizePagination('50', '10');
    assert.strictEqual(res.limit, 50);
    assert.strictEqual(res.offset, 10);

    console.log("  ✅ Pagination Logic OK");
} catch (e) {
    console.error("  ❌ Pagination Logic Failed:", e.message);
    process.exit(1);
}

// --- 2. UUID Validation Logic ---
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

try {
    console.log("  Testing UUID Validation...");
    assert.strictEqual(isValidUUID('123e4567-e89b-12d3-a456-426614174000'), true);
    assert.strictEqual(isValidUUID('invalid-uuid'), false);
    assert.strictEqual(isValidUUID('12345678-1234-1234-1234-1234567890ab-extra'), false); // Too long
    console.log("  ✅ UUID Validation OK");
} catch (e) {
    console.error("  ❌ UUID Validation Failed:", e.message);
    process.exit(1);
}

// --- 3. Health Score Validation ---
function validateHealthScore(input) {
    if (!input) return 0; // Default filter
    const score = parseInt(input);
    if (isNaN(score) || score < 0 || score > 100) {
        throw new Error('Invalid Parameter');
    }
    return score;
}

try {
    console.log("  Testing Health Score Validation...");
    assert.strictEqual(validateHealthScore('80'), 80);
    assert.strictEqual(validateHealthScore(null), 0);
    
    assert.throws(() => validateHealthScore('101'), /Invalid Parameter/);
    assert.throws(() => validateHealthScore('-1'), /Invalid Parameter/);
    assert.throws(() => validateHealthScore('abc'), /Invalid Parameter/);

    console.log("  ✅ Health Score Validation OK");
} catch (e) {
    console.error("  ❌ Health Score Validation Failed:", e.message);
    process.exit(1);
}

console.log("\n🎉 All Logic Tests Passed!");
