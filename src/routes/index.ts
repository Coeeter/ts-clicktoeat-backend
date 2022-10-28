import express, { Router } from 'express';
import path from 'path';

import branchRoutes from './BranchRoutes';
import commentRoutes from './CommentRoutes';
import dislikeRoutes from './DislikeRoutes';
import favoriteRoutes from './FavoriteRoutes';
import likeRoutes from './LikeRoutes';
import restaurantRoutes from './RestaurantRoutes';
import userRoutes from './UserRoutes';

const router = Router();

router.use(express.static(path.join(__dirname, '..', '..', 'public', 'dist')));

router.use('/api/restaurants', restaurantRoutes);
router.use('/api/branches', branchRoutes);
router.use('/api/users', userRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/favorites', favoriteRoutes);
router.use('/api/likes', likeRoutes);
router.use('/api/dislikes', dislikeRoutes);

router.use((req, res) => {
  res.sendFile(
    path.join(__dirname, '..', '..', 'public', 'dist', 'index.html')
  );
});

export default router;
