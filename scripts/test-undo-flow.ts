import { adminDb } from '../src/lib/firebase-admin';
import { createUndoAction, processUndoAction, finalizeExpiredPendingCancellations } from '../src/lib/undo';
import { adjustVouchScoreAction } from '../src/lib/actions';

async function testUndoFlow() {
    console.log('🧪 Testing undo flow...');

    try {
        // Test 1: Create a test session
        console.log('\n1. Creating test session...');
        const testSessionId = `test_session_${Date.now()}`;
        const testUserId = 'test@example.com';

        await adminDb.collection('sessions').doc(testSessionId).set({
            id: testSessionId,
            initiatorId: testUserId,
            recipientId: 'partner@example.com',
            status: 'scheduled',
            scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            durationMinutes: 60,
            focusTopic: 'Test Session',
            participantIds: [testUserId, 'partner@example.com'],
            participants: {
                [testUserId]: { name: 'Test User' },
                ['partner@example.com']: { name: 'Test Partner' }
            },
            createdAt: new Date()
        });

        console.log('✅ Test session created');

        // Test 2: Cancel the session (should create undo action)
        console.log('\n2. Cancelling session...');
        const cancelResult = await adjustVouchScoreAction({
            userId: testUserId,
            sessionId: testSessionId,
            eventType: 'CANCELLED_WITH_NOTICE'
        });

        if (cancelResult.success) {
            console.log('✅ Session cancelled successfully');
            console.log('📝 Response:', cancelResult.data);

            const undoId = cancelResult.data?.undoId;
            if (undoId) {
                console.log('🔄 Undo ID created:', undoId);

                // Test 3: Verify session is in pending_cancellation
                const sessionDoc = await adminDb.collection('sessions').doc(testSessionId).get();
                const sessionData = sessionDoc.data();
                console.log('📊 Session status:', sessionData?.status);

                if (sessionData?.status === 'pending_cancellation') {
                    console.log('✅ Session correctly moved to pending_cancellation');

                    // Test 4: Undo the cancellation
                    console.log('\n3. Testing undo...');
                    const undoResult = await processUndoAction(undoId, testUserId);

                    if (undoResult.success) {
                        console.log('✅ Undo successful');

                        // Test 5: Verify session is restored
                        const restoredSessionDoc = await adminDb.collection('sessions').doc(testSessionId).get();
                        const restoredSessionData = restoredSessionDoc.data();
                        console.log('📊 Restored session status:', restoredSessionData?.status);

                        if (restoredSessionData?.status === 'scheduled') {
                            console.log('✅ Session correctly restored to scheduled');
                        } else {
                            console.log('❌ Session not restored correctly');
                        }
                    } else {
                        console.log('❌ Undo failed:', undoResult.message);
                    }
                } else {
                    console.log('❌ Session not in pending_cancellation');
                }
            } else {
                console.log('❌ No undo ID created');
            }
        } else {
            console.log('❌ Session cancellation failed:', cancelResult.error);
        }

        // Test 6: Test cleanup function
        console.log('\n4. Testing cleanup function...');
        const cleanupResult = await finalizeExpiredPendingCancellations();
        console.log(`📊 Cleanup finalized ${cleanupResult} sessions`);

        // Cleanup: Delete test session
        console.log('\n5. Cleaning up test data...');
        await adminDb.collection('sessions').doc(testSessionId).delete();
        console.log('✅ Test session deleted');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testUndoFlow()
        .then(() => {
            console.log('\n🎉 All tests completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Test suite failed:', error);
            process.exit(1);
        });
}

export { testUndoFlow }; 