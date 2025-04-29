import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: string;
  rating: number;
  comment: string;
  date: Date;
  userName: string;
  userAvatar?: string;
  restaurantName?: string;
}

const reviewSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    restaurantId: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    userName: {
      type: String,
      required: true
    },
    userAvatar: {
      type: String
    },
    restaurantName: {
      type: String
    }
  },
  { timestamps: true }
);

// Create compound index to ensure one review per user per restaurant
reviewSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;