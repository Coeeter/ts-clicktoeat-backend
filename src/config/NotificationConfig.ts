const admin = require('firebase-admin');

const serviceAccount = require('../../private-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export enum NotificationType {
  COMMENT = 'comment',
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export interface Notification {
  title: string;
  body: string;
}

export interface NotificationData {
  type: NotificationType;
  commentId: string;
  createdItemId: string;
}

export const sendPushNotification = async (
  registrationToken: string,
  notification: Notification,
  data: NotificationData
) => {
  await admin.messaging().send({
    token: registrationToken,
    notification,
    data,
  });
};
