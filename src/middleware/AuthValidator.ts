import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken";
import config from "../config/EnvConfig";

class AuthValidator {
  public checkIfTokenExistsAndIsValid = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.length) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Login before continuing",
      });
    }
    const [bearer, token] = authorization.split(" ");
    if (bearer != "Bearer" || !token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Login before continuing",
      });
    }
    const { username, email } = verify(token, config.server.secret) as {
      username: string;
      email: string;
    };
    req.username = username;
    req.email = email;
    next();
  };
}

export default AuthValidator;
