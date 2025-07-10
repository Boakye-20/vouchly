import { runSessionCleanupJob } from '../src/lib/scheduled-jobs';

async function testSessionCleanup() {
    console.log('Testing session cleanup job...');

    try {
        const result = await runSessionCleanupJob();

        if (result.success) {
            console.log('✅ Cleanup job completed successfully');
            console.log(`📊 Finalized ${result.finalizedCount} sessions`);
            console.log(`⏰ Timestamp: ${result.timestamp}`);
        } else {
            console.error('❌ Cleanup job failed');
            console.error(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('❌ Error running cleanup job:', error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testSessionCleanup()
        .then(() => {
            console.log('Test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

export { testSessionCleanup }; 