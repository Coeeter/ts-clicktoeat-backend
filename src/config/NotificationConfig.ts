const admin = require('firebase-admin');

var serviceAccount = require('../../private-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export interface Message {
  notification: {
    title: string;
    body: string;
  };
}

export const sendPushNotification = async (
  registrationToken: string,
  message: Message
) => {
  await admin.messaging().sendToDevice(registrationToken, message, {
    priority: 'high',
  });
};
