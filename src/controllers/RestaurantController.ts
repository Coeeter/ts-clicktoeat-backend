import { Request, Response } from "express";
import { Repository } from "typeorm";
import { StatusCodes } from "http-status-codes";
import { UploadedFile } from "express-fileupload";
import { v4 } from "uuid";
import { unlink } from "fs/promises";
import { Restaurant } from "../models";
import database from "../config/DatabaseConfig";

class RestaurantController {
  private repository: Repository<Restaurant>;

  constructor(
    repository: Repository<Restaurant> = database.getRepository(Restaurant)
  ) {
    this.repository = repository;
  }

  public getAllRestaurants = async (req: Request, res: Response) => {
    try {
      const result = await this.repository.find({
        relations: {
          branches: true,
        },
      });
      res.status(StatusCodes.OK).json(result);
    } catch (e) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
  };

  public getRestaurantById = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const restaurant = await this.repository.findOneOrFail({
        relations: {
          branches: true,
        },
        where: { id },
      });
      res.status(StatusCodes.OK).json(restaurant);
    } catch (e) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: `Could not find restaurant with id ${id}`,
      });
    }
  };

  public createRestaurant = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const image: UploadedFile = [req.files?.brandImage].flat()[0]!;
    let id = v4();
    const imageUrl = v4();
    try {
      await this.repository.insert({
        id,
        name,
        description,
        imageUrl: `/uploads/restaurants/${imageUrl}.jpg`,
      });
      await image.mv(`uploads/restaurants/${imageUrl}.jpg`);
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      insertId: id,
    });
  };

  public updateRestaurant = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, description } = req.body;
    const brandImage = [req.files?.brandImage].flat()[0];
    let restaurant: Restaurant;
    try {
      restaurant = await this.repository.findOneByOrFail({ id });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: `Could not find restaurant with id ${id}`,
      });
    }
    restaurant.name = name || restaurant.name;
    restaurant.description = description || restaurant.description;
    if (brandImage) {
      const imageUrl = v4();
      await unlink(restaurant.imageUrl.slice(1));
      await brandImage?.mv(`uploads/restaurants/${imageUrl}.jpg`);
      restaurant.imageUrl = `/uploads/restaurants/${imageUrl}.jpg`;
    }
    try {
      await this.repository.save(restaurant);
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json(restaurant);
  };

  public deleteRestaurant = async (req: Request, res: Response) => {
    const id: string = req.params.id;
    let restaurant: Restaurant;
    try {
      restaurant = await this.repository.findOneByOrFail({ id });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: `Could not find restaurant with id ${id}`,
      });
    }
    try {
      await unlink(restaurant.imageUrl.slice(1));
      await this.repository.delete(restaurant);
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: `Deleted Restaurant with id ${id}`,
    });
  };
}

export default RestaurantController;
