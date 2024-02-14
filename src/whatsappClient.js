const { Client, LocalAuth } = require('whatsapp-web.js')

const initializeWhatsapp = async () => {
  try {
    const client = new Client({
        authStrategy: new LocalAuth()
    });

    return client;
  } catch (error) {
    console.error('Error initializing client:', error);
    throw error;
  }
}

module.exports = {
  initializeWhatsapp
};
