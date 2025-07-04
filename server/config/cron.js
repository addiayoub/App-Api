const cron = require('node-cron');
const planController = require('../controllers/planController');

// Exécuter tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
  console.log('Checking for expired subscriptions...');
  try {
    await planController.checkExpiredSubscriptions({}, {
      json: (result) => console.log(result.message)
    });
  } catch (error) {
    console.error('Error in subscription check:', error);
  }
});

console.log('Cron job for subscription checks scheduled...');