import kue from 'kue';

const queue = kue.createQueue();

const jobData = {
	phoneNumber: '4153518780',
	message: 'This is the code to verify your account',
};

const job = queue.create('push_notification_code', jobData)
.save((err) => {
	if (!err){
		 console.log(`Notification job created: ${job.id}`);
	} else {
		console.log('Failed to create notification job');
	}
});

job.on('failed', () => {
	console.log('Notification job failed');
});
