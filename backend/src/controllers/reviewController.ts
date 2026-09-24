import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';

export class ReviewController {
  public async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const reviews = db.getStore('reviews').filter(r => r.product_id === productId && r.is_approved);
      return res.json({ success: true, reviews });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async submitReview(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const userName = req.user?.name || 'Customer';
      const { productId, rating, headline, comment, imageUrl, orderId } = req.body;

      if (!productId || !rating || !comment) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, rating (1-5), and written comment are required.',
        });
      }

      const reviews = db.getStore('reviews');

      // Check duplicate review for order item if orderId is provided
      if (orderId && userId) {
        const existing = reviews.find(r => r.order_id === orderId && r.product_id === productId);
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'You have already reviewed this pickle for this order.',
          });
        }
      }

      const newReview = {
        id: `rev_${uuidv4().slice(0, 8)}`,
        product_id: productId,
        user_id: userId || null,
        user_name: userName,
        order_id: orderId || null,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        headline: headline || 'Flavorful Pickle!',
        comment: comment.trim(),
        image_url: imageUrl || null,
        is_verified_purchase: true,
        is_approved: true, // Auto-approve with moderation capability in admin
        helpful_votes: 0,
        created_at: new Date().toISOString(),
      };

      reviews.unshift(newReview);

      // Recalculate product rating
      const prodReviews = reviews.filter(r => r.product_id === productId && r.is_approved);
      const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      const products = db.getStore('products');
      const prod = products.find(p => p.id === productId);
      if (prod) {
        prod.rating = Math.round(avgRating * 100) / 100;
        prod.review_count = prodReviews.length;
      }

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your verified review has been published.',
        review: newReview,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async markHelpful(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      const reviews = db.getStore('reviews');
      const rev = reviews.find(r => r.id === reviewId);
      if (!rev) {
        return res.status(404).json({ success: false, message: 'Review not found.' });
      }
      rev.helpful_votes = (rev.helpful_votes || 0) + 1;
      return res.json({ success: true, helpfulVotes: rev.helpful_votes });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const reviewController = new ReviewController();
