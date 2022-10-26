import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Repository } from "typeorm";
import { v4 } from "uuid";
import database from "../config/DatabaseConfig";
import { Comment, Restaurant, User } from "../models";

class CommentController {
  private commentRepository: Repository<Comment>;
  private restaurantRepository: Repository<Restaurant>;

  constructor(
    commentRepository: Repository<Comment> = database.getRepository(Comment),
    restaurantRepository: Repository<Restaurant> = database.getRepository(
      Restaurant
    )
  ) {
    this.commentRepository = commentRepository;
    this.restaurantRepository = restaurantRepository;
  }

  public getAllComments = async (req: Request, res: Response) => {
    const { u, r } = req.query;
    if (u && r)
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid queries provided",
      });
    try {
      if (u) {
        const result = await this.commentRepository.findBy({
          user: { id: u.toString() },
        });
        return res.status(StatusCodes.OK).json(result);
      }
      if (r) {
        const result = await this.commentRepository.findBy({
          restaurant: { id: r.toString() },
        });
        return res.status(StatusCodes.OK).json(result);
      }
      const result = await this.commentRepository.find();
      res.status(StatusCodes.OK).json(result);
    } catch (e) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
  };

  public createComment = async (req: Request, res: Response) => {
    const restaurantId = req.query.r!.toString();
    const user = req.user!;
    let restaurant;
    try {
      restaurant = await this.restaurantRepository.findOneByOrFail({
        id: restaurantId,
      });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: `No restaurant with id ${restaurantId}`,
      });
    }
    const id = v4();
    const { review, rating } = req.body;
    try {
      await this.commentRepository.save({
        id,
        user,
        restaurant,
        rating,
        review,
      });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    return res.status(StatusCodes.OK).json({
      insertId: id,
    });
  };

  public updateComment = async (req: Request, res: Response) => {
    const id = req.params.id;
    let comment;
    try {
      comment = await this.commentRepository.findOneByOrFail({ id });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Cannot find comment with id " + id,
      });
    }
    if (comment.user.id != req.user!.id)
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "You cannot delete or update another user's comment",
      });
    const { review, rating } = req.body;
    if (!review && !rating)
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Need at least one field to update!",
      });
    if (review) comment.review = review;
    if (rating) comment.rating = rating;
    try {
      await this.commentRepository.save(comment);
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json(comment);
  };

  public deleteComment = async (req: Request, res: Response) => {
    const id = req.params.id;
    let comment;
    try {
      comment = await this.commentRepository.findOneByOrFail({
        id,
      });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Cannot find comment with id " + id,
      });
    }
    if (comment.user.id != req.user!.id)
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "You cannot delete or update another user's comment",
      });
    try {
      await this.commentRepository.delete({ id });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: "Deleted comment with id " + id,
    });
  };
}

export default CommentController;
