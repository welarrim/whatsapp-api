const store = require('../store.js')
const initializeCardinal = async (socketIO, client) => {
  client.on('qr', (qr) => {
      store.qr = qr
  });

  client.on('ready', async () => {
      await loadContacts(client)
      const messages = await getMessages(client)
      socketIO.emit('connected', { contacts: store.contacts, messages });
  });

  client.on('message', (msg) => {
    if (store.group.includes(msg.from)) {
      socketIO.emit('message-received', {
        id: msg.id,
        fromMe: msg.fromMe,
        type: msg.type,
        from: msg.fromMe ? 'Moi' : getContactName(msg.from),
        to: msg.fromMe ? getContactName(msg.to) : 'Moi',
        timestamp: msg.timestamp,
        body: msg.body
      });
    }
});

  // client.on('contact_changed', () => {
  //     loadContacts(client)
  // });
  socketIO.on('connection', async (socket) => {
    console.log('User connected');
    try {
      const state = await client.getState();
      if (!state) {
        socketIO.emit('qr', store.qr);
      } else {
        await loadContacts(client)
        const messages = await getMessages(client)
        socketIO.emit('connected', { contacts: store.contacts, messages });
      }
    } catch (error) {
      console.error('Error handling socket connection:', error);
    }

    socket.on('disconnect', function () {
      console.log('User disconnected');
    });

    socket.on('close-session', async () => {
      await client.logout()
      socket.emit('session-closed')
      await client.initialize();
    })

    socket.on('contactSelected', async (data) => {
      store.group = data;
      try {
        const messages = await getMessages(client)
        socketIO.emit('updateMsgs', messages);
      } catch (error) {
        console.error('Error getting chats:', error);
      }
    });

    socket.on('send-message', async (data) => {
      try {
        const msg = await client.sendMessage(data.to, data.message);
        socketIO.emit('message-received', {
          id: msg.id,
          fromMe: msg.fromMe,
          type: msg.type,
          from: msg.fromMe ? 'Moi' : getContactName(msg.from),
          to: msg.fromMe ? getContactName(msg.to) : 'Moi',
          timestamp: msg.timestamp,
          body: msg.body
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
  });
}

const loadContacts = async (client) => {
  store.contacts = []
  const contacts = await client.getContacts()
  await Promise.all(contacts.map((contact) => {
      if (contact.isUser) {
        store.contacts.push({
          id: contact.id._serialized,
          name: contact.name || contact.number
        })
      }
  }))
}

const getMessages = async (client) => {
  if (!store.group) {
    return []
  }

  const messages = [];
  await Promise.all(store.group.map(async (contactid) => {
    const contact = await client.getContactById(contactid);
    const contactChat = await contact.getChat();
    const contactChats = await contactChat.fetchMessages({limit: 200});

    await Promise.all(contactChats.map(async (msg) => {
      let body = msg.body;
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        if (media.data && media.mimetype)
          body = `data:${media.mimetype};base64,${media.data}`
        else
          body = ""
      }
      messages.push({
        id: msg.id,
        fromMe: msg.fromMe,
        type: msg.type,
        from: msg.fromMe ? 'Moi' : getContactName(msg.from),
        to: msg.fromMe ? getContactName(msg.to) : 'Moi',
        timestamp: msg.timestamp,
        body
      });
    }));
  }));

  if (messages.length > 0) {
    messages.sort((a, b) => a.timestamp - b.timestamp);
  }
  return messages;
}

const getContactName = (id) => {
  const contactName = store.contacts.find(row => row.id === id)
  return contactName ? contactName.name : id
}

module.exports = {
  initializeCardinal
};