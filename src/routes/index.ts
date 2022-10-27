import express, { Router } from 'express';

import branchRoutes from './BranchRoutes';
import commentRoutes from './CommentRoutes';
import dislikeRoutes from './DislikeRoutes';
import favoriteRoutes from './FavoriteRoutes';
import likeRoutes from './LikeRoutes';
import restaurantRoutes from './RestaurantRoutes';
import userRoutes from './UserRoutes';

const router = Router();

router.use('/uploads', express.static('uploads'));

router.use('/api/restaurants', restaurantRoutes);
router.use('/api/branches', branchRoutes);
router.use('/api/users', userRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/favorites', favoriteRoutes);
router.use('/api/likes', likeRoutes);
router.use('/api/dislikes', dislikeRoutes);

router.use((req, res) => {
  res.status(404).send('Not Found');
});

export default router;
