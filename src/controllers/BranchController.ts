import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import database from '../config/DatabaseConfig';
import { Branch, Restaurant } from '../models';

class BranchController {
  private branchRepository: Repository<Branch>;
  private restaurantRepository: Repository<Restaurant>;

  constructor(
    branchRepository = database.getRepository(Branch),
    restaurantRepository = database.getRepository(Restaurant)
  ) {
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
  }

  public getAllBranches = async (req: Request, res: Response) => {
    try {
      const result = await this.branchRepository.find();
      res.status(StatusCodes.OK).json(result);
    } catch (e) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
  };

  public saveBranch = async (req: Request, res: Response) => {
    const restaurantId = req.params.id!.toString();
    let restaurant: Restaurant;
    try {
      restaurant = await this.restaurantRepository.findOneByOrFail({
        id: restaurantId,
      });
    } catch (e) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: `No restaurant with id ${restaurantId}`,
      });
    }
    const id = v4();
    const { address, latitude, longitude } = req.body;
    try {
      await this.branchRepository.save({
        id,
        address,
        latitude,
        longitude,
        restaurant,
      });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({ insertId: id });
  };

  public deleteBranch = async (req: Request, res: Response) => {
    const { restaurantId } = req.body;
    let restaurant: Restaurant;
    try {
      restaurant = await this.restaurantRepository.findOneByOrFail({
        id: restaurantId,
      });
    } catch (e) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: `No restaurant with id ${restaurantId}`,
      });
    }
    const branchId = req.params.id;
    try {
      await this.branchRepository.delete({
        id: branchId,
      });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: `Deleted Branch with id ${branchId} from restaurant ${restaurant.name}(${restaurant.id})`,
    });
  };
}

export default BranchController;
