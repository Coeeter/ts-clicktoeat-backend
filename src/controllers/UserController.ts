import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Repository } from "typeorm";
import { v4 } from "uuid";
import { unlink } from "fs/promises";
import database from "../config/DatabaseConfig";
import { Restaurant, User } from "../models";

class UserController {
  private userRepository: Repository<User>;
  private restaurantRepository: Repository<Restaurant>;

  constructor(
    userRepository = database.getRepository(User),
    restaurantRepository = database.getRepository(Restaurant)
  ) {
    this.userRepository = userRepository;
    this.restaurantRepository = restaurantRepository;
  }

  public getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userRepository
        .createQueryBuilder("user")
        .select(["user.id", "user.username", "user.email", "user.image"])
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
        .createQueryBuilder("user")
        .select(["user.id", "user.username", "user.email", "user.image"])
        .where("user.id = :id", { id })
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
    const { username, email, password } = req.body;
    const image = [req.files?.image].flat()[0];
    const user = new User();
    user.id = v4();
    user.username = username;
    user.email = email;
    await user.setPassword(password);
    try {
      if (image) {
        const name = v4();
        user.image = `/uploads/users/${name}.jpg`;
        await image.mv(`uploads/users/${name}.jpg`);
      }
      await this.userRepository.insert(user);
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      token: user.generateToken(),
    });
  };

  public updateUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const image = [req.files?.image].flat()[0];
    if (!username && !email && !password && !image) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Need at least one field to update!",
      });
    }
    const user = req.user!;
    if (username) user.username = username;
    if (email) user.email = username;
    if (password) user.setPassword(password);
    try {
      if (image) {
        if (user.image && user.image.length) {
          await unlink(user.image.slice(1));
        }
        const name = v4();
        user.image = `/uploads/users/${name}.jpg`;
        await image.mv(`uploads/users/${name}.jpg`);
      }
      await this.userRepository.save(user);
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
      if (user.image) await unlink(user.image.slice(1));
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
      res.redirect(`/api/users/${req.user!.id}`);
    } catch (e) {
      console.log(e);
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid token provided",
      });
    }
  };

  public getUserFavorites = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const result = await this.userRepository.findOne({
        where: { id },
        relations: { favoriteRestaurants: true },
      });
      res.status(StatusCodes.OK).json(result?.favoriteRestaurants ?? []);
    } catch (e) {
      console.log(e);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
  };

  public addFavorite = async (req: Request, res: Response) => {
    const restaurantId = req.params.id;
    let restaurant;
    try {
      restaurant = await this.restaurantRepository.findOneByOrFail({
        id: restaurantId,
      });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid restaurant id provided",
      });
    }
    let user;
    try {
      user = await this.userRepository.findOneOrFail({
        where: { id: req.user!.id },
        relations: { favoriteRestaurants: true },
      });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid token provided",
      });
    }
    if (
      user?.favoriteRestaurants &&
      user?.favoriteRestaurants.map(item => item.id).includes(restaurantId)
    )
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Already favorited restaurant with id " + restaurantId,
      });
    try {
      await this.userRepository.save({
        ...user,
        favoriteRestaurants: [...(user?.favoriteRestaurants ?? []), restaurant],
      });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: "Successfully favorited restaurant with id " + restaurantId,
    });
  };

  public deleteFavorite = async (req: Request, res: Response) => {
    const restaurantId = req.params.id;
    let user;
    try {
      user = await this.userRepository.findOneOrFail({
        where: { id: req.user!.id },
        relations: { favoriteRestaurants: true },
      });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid token provided",
      });
    }
    user.favoriteRestaurants = user.favoriteRestaurants.filter(item => {
      return item.id !== restaurantId;
    });
    try {
      await this.userRepository.save(user);
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: `Successfully removed restaurant from favorites`,
    });
  };
}

export default UserController;
