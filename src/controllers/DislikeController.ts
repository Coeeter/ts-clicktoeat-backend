import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Repository } from "typeorm";
import database from "../config/DatabaseConfig";
import { Comment, User } from "../models";

class DislikeController {
  private userRepository: Repository<User>;
  private commentRepository: Repository<Comment>;

  constructor(
    userRepository = database.getRepository(User),
    commentRepository = database.getRepository(Comment)
  ) {
    this.userRepository = userRepository;
    this.commentRepository = commentRepository;
  }

  public getDislikes = async (req: Request, res: Response) => {
    const { u, c } = req.query;
    if (u && c)
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid queries provided",
      });
    try {
      if (u) {
        const result = await this.userRepository.findOneOrFail({
          where: { id: u.toString() },
          relations: { dislikedComments: true },
        });
        return res
          .status(StatusCodes.OK)
          .json(result.dislikedComments.map(this.transformComment));
      }
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid user id provided",
      });
    }
    try {
      if (c) {
        const result = await this.commentRepository.findOneOrFail({
          where: { id: c.toString() },
          relations: { dislikes: true },
        });
        return res
          .status(StatusCodes.OK)
          .json(result.dislikes.map(this.transformUser));
      }
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid comment id provided",
      });
    }
    try {
      const result = await this.commentRepository.find({
        relations: { dislikes: true },
      });
      res.status(StatusCodes.OK).json(
        result
          .map(item => {
            if (!item.dislikes.length) return [];
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

  public createDislike = async (req: Request, res: Response) => {
    const commentId = req.params.id;
    let comment;
    try {
      comment = await this.commentRepository.findOneOrFail({
        where: { id: commentId },
        relations: { dislikes: true, likes: true },
      });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid comment id provided",
      });
    }
    if (
      comment.dislikes.length &&
      comment.dislikes.map(item => item.id).includes(req.user!.id)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "User already disliked this comment",
      });
    }
    if (
      comment.likes.length &&
      comment.likes.map(item => item.id).includes(req.user!.id)
    ) {
      comment.likes = comment.likes.filter(item => {
        return item.id !== req.user!.id;
      });
    }
    try {
      await this.commentRepository.save({
        ...comment,
        dislikes: [...comment.dislikes, req.user!],
      });
    } catch (e) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: e,
      });
    }
    res.status(StatusCodes.OK).json({
      message: "Successfully disliked comment with id " + commentId,
    });
  };

  public deleteDislike = async (req: Request, res: Response) => {
    const commentId = req.params.id;
    let comment;
    try {
      comment = await this.commentRepository.findOneOrFail({
        where: { id: commentId },
        relations: { dislikes: true },
      });
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid comment id provided",
      });
    }
    comment.dislikes = comment.dislikes.filter(item => {
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
      message: "Successfully deleted dislike from comment with id " + commentId,
    });
  };

  private transformComment = (comment: Comment) => {
    return {
      ...comment,
      user: {
        ...comment.user,
        password: undefined,
      },
    };
  };

  private transformUser = (user: User) => {
    return {
      ...user,
      password: undefined,
    };
  };
}

export default DislikeController;
