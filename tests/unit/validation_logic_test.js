// Unit Test for Validation Logic (Node.js)
const assert = require('assert');

function validateSubmission(payload) {
    const errors = [];
    if (!payload.name || payload.name.trim() === '') errors.push('name is required');
    if (!payload.source_url || payload.source_url.trim() === '') errors.push('source_url is required');
    if (payload.source_url) {
        try {
            const url = new URL(payload.source_url);
            if (url.protocol !== 'https:') errors.push('source_url must be HTTPS');
        } catch {
            errors.push('source_url is invalid');
        }
    }
    if (payload.amount_min !== undefined && payload.amount_max !== undefined) {
        if (payload.amount_min > payload.amount_max) errors.push('amount_min cannot be greater than amount_max');
    }
    if (payload.name && /<script|javascript:/i.test(payload.name)) {
        errors.push('name contains illegal characters');
    }
    return errors;
}

console.log("🧪 Testing Validation Logic...");

// Test 1: Valid
const valid = validateSubmission({
    name: "Valid Scholarship",
    source_url: "https://example.com",
    amount_min: 100,
    amount_max: 200
});
assert.strictEqual(valid.length, 0);
console.log("  ✅ Valid Submission OK");

// Test 2: HTTP URL
const http = validateSubmission({
    name: "Valid",
    source_url: "http://example.com"
});
assert.ok(http.includes("source_url must be HTTPS"));
console.log("  ✅ HTTPS Check OK");

// Test 3: Invalid Amounts
const amounts = validateSubmission({
    name: "Valid",
    source_url: "https://example.com",
    amount_min: 500,
    amount_max: 100
});
assert.ok(amounts.includes("amount_min cannot be greater than amount_max"));
console.log("  ✅ Amount Consistency OK");

// Test 4: XSS
const xss = validateSubmission({
    name: "<script>alert(1)</script>",
    source_url: "https://example.com"
});
assert.ok(xss.includes("name contains illegal characters"));
console.log("  ✅ XSS Check OK");

console.log("🎉 Validation Logic Verified");
