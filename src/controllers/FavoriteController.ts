import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';

import database from '../config/DatabaseConfig';
import { Restaurant, User } from '../models';

class FavoriteController {
  private userRepository: Repository<User>;
  private restaurantRepository: Repository<Restaurant>;

  constructor(
    userRepository = database.getRepository(User),
    restaurantRepository = database.getRepository(Restaurant)
  ) {
    this.userRepository = userRepository;
    this.restaurantRepository = restaurantRepository;
  }

  public getUserFavorites = async (req: Request, res: Response) => {
    const userId = req.params.id;
    try {
      const result = await this.userRepository.findOne({
        where: { id: userId },
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

  public getFavoriteUsers = async (req: Request, res: Response) => {
    const restaurantId = req.params.id;
    try {
      const result = await this.restaurantRepository.findOneOrFail({
        where: { id: restaurantId },
        relations: { favoriteUsers: true },
      });
      res.status(StatusCodes.OK).json(
        result.favoriteUsers.map((item: User) => {
          return {
            ...item,
            password: undefined,
          };
        })
      );
    } catch (e) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: `Could not find restaurant with id ${restaurantId}`,
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
        error: 'Invalid restaurant id provided',
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
        error: 'Invalid token provided',
      });
    }
    if (
      user?.favoriteRestaurants &&
      user?.favoriteRestaurants.map(item => item.id).includes(restaurantId)
    )
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Already favorited restaurant with id ' + restaurantId,
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
      message: 'Successfully favorited restaurant with id ' + restaurantId,
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
        error: 'Invalid token provided',
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

export default FavoriteController;
