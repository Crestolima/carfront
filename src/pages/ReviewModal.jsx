import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ReviewModal = ({ isOpen, onClose, booking, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateReview = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return false;
    }
    if (comment.length < 10) {
      toast.error('Review comment must be at least 10 characters long');
      return false;
    }
    if (comment.length > 500) {
      toast.error('Review comment cannot exceed 500 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateReview()) return;
  
    setIsSubmitting(true);
    try {
      const response = await api.post(`/reviews/booking/${booking._id}`, {
        rating,
        comment
      });
  
      toast.success(response.data.message || 'Review submitted successfully');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error submitting review';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = comment.length;
  const isCharacterCountValid = characterCount >= 10 && characterCount <= 500;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Review Your Experience</h2>
        <p className="text-gray-600 mb-6">
          {booking.car?.make} {booking.car?.model} ({booking.car?.year})
        </p>

        {/* Star Rating */}
        <div className="flex items-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hover || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {rating === 0 ? 'Select your rating' : `You rated ${rating} star${rating !== 1 ? 's' : ''}`}
        </p>

        {/* Review Text */}
        <div className="mb-6">
          <textarea
            className={`w-full p-3 border rounded-lg mb-2 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              comment.length > 0 && !isCharacterCountValid ? 'border-red-500' : ''
            }`}
            placeholder="Share your experience (minimum 10 characters)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className={`text-sm ${isCharacterCountValid ? 'text-gray-500' : 'text-red-500'}`}>
            {characterCount}/500 characters
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            onClick={handleSubmit}
            disabled={isSubmitting || !isCharacterCountValid || rating === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;