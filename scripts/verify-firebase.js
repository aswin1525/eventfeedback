const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.error('❌ Missing FIREBASE_PRIVATE_KEY in .env.local');
    process.exit(1);
}

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
    console.log('✅ Firebase Admin Initialized');
} catch (error) {
    console.error('❌ Firebase Init Failed:', error);
    process.exit(1);
}

const db = admin.firestore();

async function testConnection() {
    try {
        console.log('🔄 Attempting to write to Firestore...');
        const testRef = db.collection('_test_connection').doc('ping');
        await testRef.set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'ok'
        });
        console.log('✅ Write successful!');

        console.log('🔄 Attempting to read from Firestore...');
        const doc = await testRef.get();
        if (doc.exists) {
            console.log('✅ Read successful:', doc.data());
        } else {
            console.error('❌ Read failed: Document not found');
        }

        // Cleanup
        await testRef.delete();
        console.log('✅ Cleanup successful!');

    } catch (error) {
        console.error('❌ Firestore Connection Failed:', error);
    }
}

testConnection();
