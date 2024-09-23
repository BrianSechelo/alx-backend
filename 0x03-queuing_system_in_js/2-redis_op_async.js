import { createClient, print } from 'redis';
import { promisify } from 'util';

const client = createClient();

client.on('connect', () => {
  console.log('Redis client connected to the server');
});

client.on('error', (err) => {
  console.log(`Redis client not connected to the server: ${err.message}`);
});

const getAsync = promisify(client.get).bind(client);

function setNewSchool(schoolName, value) {
  client.set(schoolName, value, (err, reply) => {
    if (err) {
      console.log('Error setting value:', err);
    } else {
      console.log('Reply:', reply);
    }
  });
}

async function displaySchoolValue(schoolName) {
	try{
		const value = await getAsync(schoolName);
		console.log(value);
	}
	catch (err) {
		console.log('Error retrieving value:', err);
	}
}

displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');
