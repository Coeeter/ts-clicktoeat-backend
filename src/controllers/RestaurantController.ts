import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import database from '../config/DatabaseConfig';
import { deleteImageFromS3, uploadImageToS3 } from '../config/S3Config';
import { Restaurant } from '../models';
import Image from '../models/Image';

class RestaurantController {
  private repository: Repository<Restaurant>;
  private imageRepository: Repository<Image>;

  constructor(
    repository = database.getRepository(Restaurant),
    imageRepository = database.getRepository(Image)
  ) {
    this.repository = repository;
    this.imageRepository = imageRepository;
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
      console.log(e);
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
    try {
      const key = `restaurants/${v4()}.jpg`;
      const { uploadedUrl, error } = await uploadImageToS3(key, image.data);
      if (error || !uploadedUrl)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: error ?? 'Unable to upload image',
        });
      const restaurantImage = new Image();
      restaurantImage.key = key;
      restaurantImage.url = uploadedUrl;
      await this.imageRepository.insert(restaurantImage);
      await this.repository.insert({
        id,
        name,
        description,
        image: restaurantImage,
      });
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
    if (!name && !description && !brandImage)
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Need at least one field to update!',
      });
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
      const deletionResult = await deleteImageFromS3(restaurant.image.key);
      if (deletionResult && deletionResult.error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: deletionResult.error,
        });
      const key = `restaurants/${v4()}.jpg`;
      const { uploadedUrl, error } = await uploadImageToS3(
        key,
        brandImage.data
      );
      if (error || !uploadedUrl)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: error ?? 'Unable to upload image',
        });
      restaurant.image.key = key;
      restaurant.image.url = uploadedUrl;
      await this.imageRepository.save(restaurant.image);
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
      const deletionResult = await deleteImageFromS3(restaurant.image.key);
      if (deletionResult && deletionResult.error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: deletionResult.error,
        });
      await this.imageRepository.delete(restaurant.image);
      await this.repository.delete({
        id: restaurant.id,
        name: restaurant.name,
      });
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
