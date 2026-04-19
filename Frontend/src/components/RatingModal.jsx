import React, { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';

const RatingModal = ({ isOpen, lawyerName, lawyerId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const buttonBaseClass =
    'rounded-lg px-6 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';

  const handleStarClick = (star) => {
    setRating(star);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        lawyerId,
      });
      
      // Reset form
      setRating(0);
      setComment('');
      setError('');
      // Don't show toast here - let parent component handle it
      onClose();
    } catch (err) {
      // Set error message in modal for display
      setError(err.message || 'Failed to submit rating');
      // Don't show toast here - let parent component handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="max-h-[95vh] w-[95%] max-w-[500px] overflow-y-auto rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:max-h-[90vh] sm:w-[90%]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">
          <h2 className="m-0 text-xl font-semibold text-gray-900">Rate Your Experience</h2>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex items-center justify-center rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-5 sm:gap-6 sm:p-6 sm:pt-8">
          <p className="m-0 text-center text-base text-gray-600">
            How was your experience with <strong className="font-semibold text-gray-900">{lawyerName}</strong>?
          </p>

          {/* Star Rating */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="flex items-center justify-center rounded p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 sm:p-1"
                type="button"
                disabled={isSubmitting}
              >
                <Star
                  className={`h-8 w-8 transition-all sm:h-10 sm:w-10 ${
                    star <= (hoverRating || rating) 
                      ? 'fill-amber-400 text-amber-500' 
                      : 'fill-none text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          {rating > 0 && (
            <p className="m-0 text-center text-sm font-medium text-amber-500">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}

          {/* Comment Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="comment" className="text-sm font-medium text-gray-900">
              Add a comment (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your feedback about this lawyer..."
              className="w-full resize-y rounded-lg border border-gray-200 p-3 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
              rows="4"
              disabled={isSubmitting}
              maxLength="500"
            />
            <p className="m-0 text-right text-xs text-gray-400">
              {comment.length}/500
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end sm:gap-3 sm:p-6 sm:py-4">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`${buttonBaseClass} border border-gray-200 bg-gray-100 text-gray-900 hover:-translate-y-0.5 hover:bg-gray-200`}
            type="button"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className={`${buttonBaseClass} bg-blue-500 text-white hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]`}
            type="button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
