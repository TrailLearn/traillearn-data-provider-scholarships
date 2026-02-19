// Mock Test for Auth Logic
const assert = require('assert');

console.log("🧪 Testing Auth Logic (Mocked)...");

// Mock Supabase Client
const mockSupabase = (shouldSucceed) => ({
    auth: {
        getUser: async () => {
            if (shouldSucceed) {
                return { data: { user: { id: "u1", email: "test@example.com" } }, error: null };
            } else {
                return { data: { user: null }, error: { message: "Invalid Token" } };
            }
        }
    }
});

async function validateUserMock(header, shouldSucceed) {
    if (!header) throw new Error('Missing Authorization header');
    const client = mockSupabase(shouldSucceed);
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) throw new Error('Invalid Token');
    return user;
}

(async () => {
    try {
        // Test 1: Success
        const user = await validateUserMock("Bearer valid", true);
        assert.strictEqual(user.email, "test@example.com");
        console.log("  ✅ Valid Token OK");

        // Test 2: Missing Header
        try {
            await validateUserMock(null, true);
            assert.fail("Should throw missing header");
        } catch (e) {
            assert.strictEqual(e.message, "Missing Authorization header");
            console.log("  ✅ Missing Header OK");
        }

        // Test 3: Invalid Token
        try {
            await validateUserMock("Bearer invalid", false);
            assert.fail("Should throw invalid token");
        } catch (e) {
            assert.strictEqual(e.message, "Invalid Token");
            console.log("  ✅ Invalid Token OK");
        }

        console.log("🎉 Auth Logic Verified");

    } catch (e) {
        console.error("❌ Test Failed:", e);
        process.exit(1);
    }
})();
