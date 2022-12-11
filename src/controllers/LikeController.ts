import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';

import database from '../config/DatabaseConfig';
import { NotificationType } from '../config/NotificationConfig';
import { Comment, User } from '../models';

class LikeController {
  private userRepository: Repository<User>;
  private commentRepository: Repository<Comment>;

  constructor(
    userRepository = database.getRepository(User),
    commentRepository = database.getRepository(Comment)
  ) {
    this.userRepository = userRepository;
    this.commentRepository = commentRepository;
  }

  public getLikes = async (req: Request, res: Response) => {
    const { user, comment } = req.query;
    if (user && comment)
      return res.status(StatusCodes.BAD_REQUEST).json({
        error:
          'Invalid body provided. Only one field is accepted or none at all.',
      });
    try {
      if (user) {
        const result = await this.userRepository.findOneOrFail({
          where: { id: user.toString() },
          relations: { likedComments: true },
        });
        return res
          .status(StatusCodes.OK)
          .json(result.likedComments.map(this.transformComment));
      }
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid user id provided',
      });
    }
    try {
      if (comment) {
        const result = await this.commentRepository.findOneOrFail({
          where: { id: comment.toString() },
          relations: { likes: true },
        });
        return res
          .status(StatusCodes.OK)
          .json(result.likes.map(this.transformUser));
      }
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid comment id provided',
      });
    }
    try {
      const result = await this.commentRepository.find({
        relations: { likes: true },
      });
      res.status(StatusCodes.OK).json(
        result
          .map(item => {
            if (!item.likes.length) return [];
            return {
              commentId: item.id,
              userId: item.user.id,
            };
          })
          .flat()
      );
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
  };

  public createLike = async (req: Request, res: Response) => {
    const commentId = req.params.id;
    let comment;
    try {
      comment = await this.commentRepository.findOneOrFail({
        where: { id: commentId },
        relations: { likes: true, dislikes: true },
      });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid comment id provided',
      });
    }
    if (
      comment.likes.length &&
      comment.likes.map(item => item.id).includes(req.user!.id)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'User already liked this comment',
      });
    }
    if (
      comment.dislikes.length &&
      comment.dislikes.map(item => item.id).includes(req.user!.id)
    ) {
      comment.dislikes = comment.dislikes.filter(item => {
        return item.id !== req.user!.id;
      });
    }
    try {
      await comment.user.sendPushNotificationToDevice(
        NotificationType.LIKE,
        req.user!.username,
        comment.id,
        req.user!.id
      );
      await this.commentRepository.save({
        ...comment,
        likes: [...comment.likes, req.user!],
      });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: 'Successfully liked comment with id ' + commentId,
    });
  };

  public deleteLike = async (req: Request, res: Response) => {
    const commentId = req.params.id;
    let comment;
    try {
      comment = await this.commentRepository.findOneOrFail({
        where: { id: commentId },
        relations: { likes: true },
      });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid comment id provided',
      });
    }
    comment.likes = comment.likes.filter(item => {
      return item.id !== req.user!.id;
    });
    try {
      await this.commentRepository.save(comment);
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: 'Successfully deleted like from comment with id ' + commentId,
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

  private transformUser = (user: User) => {
    return {
      ...user,
      fcmToken: undefined,
      password: undefined,
    };
  };
}

export default LikeController;
