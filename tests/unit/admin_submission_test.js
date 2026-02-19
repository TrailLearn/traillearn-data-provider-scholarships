// Unit Test for Admin Submission Logic
const assert = require('assert');

function determineStatus(user, requestedStatus) {
    let finalStatus = 'SUBMITTED';
    const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'service_role';
    
    if (isAdmin && requestedStatus) {
        const allowedStatuses = ['DRAFT', 'SUBMITTED', 'VERIFIED', 'DEPRECATED', 'ARCHIVED'];
        if (allowedStatuses.includes(requestedStatus)) {
            finalStatus = requestedStatus;
        }
    }
    return finalStatus;
}

console.log("🧪 Testing Admin Override Logic...");

// 1. Normal User
const normalUser = { app_metadata: { role: 'authenticated' } };
assert.strictEqual(determineStatus(normalUser, 'VERIFIED'), 'SUBMITTED', 'Normal user cannot override');
console.log("  ✅ Normal User Restricted");

// 2. Admin User
const adminUser = { app_metadata: { role: 'admin' } };
assert.strictEqual(determineStatus(adminUser, 'VERIFIED'), 'VERIFIED', 'Admin can set VERIFIED');
assert.strictEqual(determineStatus(adminUser, 'DRAFT'), 'DRAFT', 'Admin can set DRAFT');
assert.strictEqual(determineStatus(adminUser, 'INVALID_STATUS'), 'SUBMITTED', 'Invalid status fallback');
console.log("  ✅ Admin User Allowed");

// 3. Service Role
const serviceUser = { app_metadata: { role: 'service_role' } };
assert.strictEqual(determineStatus(serviceUser, 'VERIFIED'), 'VERIFIED', 'Service role allowed');
console.log("  ✅ Service Role Allowed");

console.log("🎉 Admin Logic Verified");
