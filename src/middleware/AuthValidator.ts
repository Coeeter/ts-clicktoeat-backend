import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verify } from 'jsonwebtoken';
import { Repository } from 'typeorm';

import database from '../config/DatabaseConfig';
import config from '../config/EnvConfig';
import { User } from '../models';

class AuthValidator {
  private repository: Repository<User>;

  constructor(repository: Repository<User> = database.getRepository(User)) {
    this.repository = repository;
  }

  public checkIfTokenExistsAndIsValid = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.length) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Login before continuing',
      });
    }
    const [bearer, token] = authorization.split(' ');
    if (bearer != 'Bearer' || !token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Login before continuing',
      });
    }
    let user;
    try {
      const { id, username, email } = verify(token, config.server.secret) as {
        id: string;
        username: string;
        email: string;
      };
      if (!id || !username || !email) throw new Error();
      user = await this.repository.findOneByOrFail({
        id,
        email,
        username,
      });
    } catch (e) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Invalid token provided',
      });
    }
    req.user = user;
    next();
  };
}

export default AuthValidator;
