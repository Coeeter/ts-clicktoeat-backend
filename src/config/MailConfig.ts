import { createTransport } from 'nodemailer';

import config from './EnvConfig';

const transport = createTransport({
  service: 'gmail',
  auth: {
    user: config.server.email,
    pass: config.server.emailPassword,
  },
});

export const sendPasswordResetEmail = async (email: string, link: string) => {
  try {
    const url = `${config.server.host}${link}`;
    const { accepted } = await transport.sendMail({
      from: config.server.email,
      to: email,
      subject: 'Reset password for account',
      html: `<a href="${url}">Reset Password here</a>`,
    });
    return { accepted };
  } catch (e) {
    return { error: e };
  }
};
