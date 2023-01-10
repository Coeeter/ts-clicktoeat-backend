import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import database from '../config/DatabaseConfig';
import { NotificationType } from '../config/NotificationConfig';
import { Comment, Restaurant } from '../models';

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

  public getComments = async (req: Request, res: Response) => {
    const { user, restaurant } = req.query;
    if (user && restaurant)
      return res.status(StatusCodes.BAD_REQUEST).json({
        error:
          'Invalid body provided. Only one field is accepted or none at all.',
      });
    try {
      if (user) {
        const result = await this.commentRepository.findBy({
          user: { id: user.toString() },
        });
        return res
          .status(StatusCodes.OK)
          .json(result.map(this.transformComment));
      }
      if (restaurant) {
        const result = await this.commentRepository.findBy({
          restaurant: { id: restaurant.toString() },
        });
        return res
          .status(StatusCodes.OK)
          .json(result.map(this.transformComment));
      }
      const result = await this.commentRepository.find();
      res.status(StatusCodes.OK).json(result.map(this.transformComment));
    } catch (e) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
  };

  public getCommentsById = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const result = await this.commentRepository.findOneBy({ id });
      if (result == null)
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `Comment with id ${id} not found`,
        });
      return res.status(StatusCodes.OK).json(this.transformComment(result));
    } catch (e) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
  };

  public createComment = async (req: Request, res: Response) => {
    const restaurantId = req.params.id!.toString();
    const user = req.user!;
    let restaurant;
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
    let { review, rating, parentComment } = req.body;
    let parent: Comment | undefined;
    let parentId = parentComment;
    try {
      if (parentComment) {
        parent = await this.commentRepository.findOneByOrFail({
          id: parentComment,
        });
        review = `@${parent.user.username} ${review}`;
        if (parent.parentComment) {
          const result = await this.commentRepository.findOneByOrFail({
            id: parent.parentComment,
          });
          parentId = result.id;
        }
      }
    } catch (e) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Cannot find comment with id ' + parentComment,
      });
    }
    try {
      if (parent && user.username !== parent.user.username) {
        await parent.user.sendPushNotificationToDevice(
          NotificationType.COMMENT,
          user.username,
          parent.id,
          id
        );
      }
      await this.commentRepository.save({
        id,
        user,
        restaurant,
        rating,
        review,
        parentComment: parentId,
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
        error: 'Cannot find comment with id ' + id,
      });
    }
    if (comment.user.id != req.user!.id)
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "You cannot delete or update another user's comment",
      });
    const { review, rating } = req.body;
    if (!review && !rating)
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Need at least one field to update!',
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
    res.status(StatusCodes.OK).json(this.transformComment(comment));
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
        error: 'Cannot find comment with id ' + id,
      });
    }
    if (comment.user.id != req.user!.id)
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "You cannot delete or update another user's comment",
      });
    try {
      await this.commentRepository.delete({ id });
      await this.commentRepository.delete({ parentComment: id });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: 'Deleted comment with id ' + id,
    });
  };

  private transformComment = (comment: Comment) => {
    return {
      ...comment,
      user: {
        ...comment.user,
        fcmToken: undefined,
        password: undefined,
      },
    };
  };
}

export default CommentController;
