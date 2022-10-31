const admin = require('firebase-admin')

const serviceAccount = require('../../private-key.json');

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
  { notification }: Message
) => {
  await admin.messaging().send({
    token: registrationToken,
    notification: notification,
    data: notification,
  });
};
