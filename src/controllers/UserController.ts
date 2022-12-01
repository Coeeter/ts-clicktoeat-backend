import { NextFunction, Request, Response, urlencoded } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verify } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import database from '../config/DatabaseConfig';
import config from '../config/EnvConfig';
import { sendPasswordResetEmail } from '../config/MailConfig';
import { deleteImageFromS3, uploadImageToS3 } from '../config/S3Config';
import { Image, User } from '../models';

class UserController {
  private userRepository: Repository<User>;
  private imageRepository: Repository<Image>;

  constructor(
    userRepository = database.getRepository(User),
    imageRepository = database.getRepository(Image)
  ) {
    this.userRepository = userRepository;
    this.imageRepository = imageRepository;
  }

  public getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.username', 'user.email'])
        .leftJoinAndSelect('user.image', 'image')
        .getMany();
      res.status(StatusCodes.OK).json(users);
    } catch (e) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
  };

  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const id = req.params.id;
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.username', 'user.email'])
        .leftJoinAndSelect('user.image', 'image')
        .where('user.id = :id', { id })
        .getOne();
      if (!user) return next();
      res.status(StatusCodes.OK).json(user);
    } catch (e) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
  };

  public createUser = async (req: Request, res: Response) => {
    const { username, email, password, fcmToken } = req.body;
    const image = [req.files?.image].flat()[0];
    const user = new User();
    user.id = v4();
    user.username = username;
    user.email = email;
    if (fcmToken) user.fcmToken = fcmToken;
    await user.setPassword(password);
    try {
      if (image) {
        const result = await this.uploadImage(req, res, image.data);
        if (!result) throw new Error('Unable to upload image');
        const { key, uploadedUrl } = result;
        const userImage = new Image();
        userImage.key = key;
        userImage.url = uploadedUrl;
        await this.imageRepository.insert(userImage);
        user.image = userImage;
      }
      await this.userRepository.insert(user);
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      token: user.generateToken(),
    });
  };

  public updateUser = async (req: Request, res: Response) => {
    const { username, email, password, deleteImage, fcmToken } = req.body;
    const image = [req.files?.image].flat()[0];
    if (image && deleteImage)
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid body given. Cannot delete image, when given new image',
      });
    if (
      !username &&
      !email &&
      !password &&
      !image &&
      !deleteImage &&
      !fcmToken
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Need at least one field to update!',
      });
    }
    const user = req.user!;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) await user.setPassword(password);
    if (fcmToken) user.fcmToken = fcmToken;
    try {
      if (deleteImage || (image && user.image)) {
        const result = this.deleteImage(req, res, user.image.key);
        if (!result) throw new Error('Unable to upload image');
      }
      if (image) {
        const result = await this.uploadImage(req, res, image.data);
        if (!result || !result.uploadedUrl)
          throw new Error('Unable to upload image');
        user.image.key = result.key;
        user.image.url = result.uploadedUrl;
        await this.imageRepository.save(user.image);
      }
      await this.userRepository.save(user);
      if (deleteImage) {
        await this.imageRepository.delete(user.image);
      }
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      token: user.generateToken(),
    });
  };

  public loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    let user;
    try {
      user = await this.userRepository.findOneByOrFail({ email });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: `Cannot find user with email ${email}`,
      });
    }
    const isCorrectPassword = await user.comparePasswords(password);
    if (!isCorrectPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: `Invalid password given`,
      });
    }
    res.status(StatusCodes.OK).json({
      token: user.generateToken(),
    });
  };

  public deleteUser = async (req: Request, res: Response) => {
    const { password } = req.body;
    let user = req.user!;
    const isCorrectPassword = await user.comparePasswords(password);
    if (!isCorrectPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: `Invalid password given`,
      });
    }
    try {
      if (user.image) {
        const result = this.deleteImage(req, res, user.image.key);
        if (!result) return;
        await this.imageRepository.delete(user.image);
      }
      await this.userRepository.delete({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: `Successfully deleted user with email ${user.email}`,
    });
  };

  public validateIfUserIsStillLoggedIn = async (
    req: Request,
    res: Response
  ) => {
    try {
      if (!req.user) throw new Error();
      res.status(StatusCodes.OK).json({
        ...req.user,
        fcmToken: undefined,
        password: undefined,
      });
    } catch (e) {
      console.log(e);
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid token provided',
      });
    }
  };

  private deleteImage = async (req: Request, res: Response, key: string) => {
    const deletionResult = await deleteImageFromS3(key);
    if (deletionResult && deletionResult.error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: deletionResult.error,
      });
      return false;
    }
    return true;
  };

  private uploadImage = async (req: Request, res: Response, buffer: Buffer) => {
    const key = `users/${v4()}.jpg`;
    const { uploadedUrl, error } = await uploadImageToS3(key, buffer);
    if (error || !uploadedUrl) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: error ?? 'Unable to upload image',
      });
      return;
    }
    return { key, uploadedUrl };
  };

  public sendPasswordResetLinkToEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    let user;
    try {
      user = await this.userRepository.findOneByOrFail({ email });
    } catch (e) {
      return res.status(StatusCodes.OK).json({
        message: 'Sent password reset link to email if it has an account',
      });
    }
    const urlEndPoint = user.generatePasswordResetUrl();
    const { accepted, error } = await sendPasswordResetEmail(
      email,
      urlEndPoint
    );
    if (error || !accepted || !accepted.length)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: error ?? 'Unknown error has occurred',
      });
    res.status(StatusCodes.OK).json({
      message: 'Sent password reset link to email if it has an account',
    });
  };

  public validatePasswordResetLink = async (req: Request, res: Response) => {
    const { email, credential } = req.body;
    let decodedEmail;
    try {
      decodedEmail = verify(email, config.server.secret) as {
        email: string;
      };
    } catch (e) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Invalid link given',
      });
    }
    let user;
    try {
      user = await this.userRepository.findOneByOrFail({
        email: decodedEmail.email,
      });
    } catch (e) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Invalid link given',
      });
    }
    const isValid = user.isPasswordResetCredentialsValid(credential);
    if (!isValid)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Invalid link given',
      });
    res.status(StatusCodes.OK).json({
      token: user.generateToken(),
    });
  };
}

export default UserController;
