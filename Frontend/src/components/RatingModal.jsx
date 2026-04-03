import React, { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import './RatingModal.css';

const RatingModal = ({ isOpen, lawyerName, lawyerId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      toast.success('Thank you! Your rating has been submitted.');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
      toast.error('Failed to submit rating');
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
    <div className="rating-modal-overlay">
      <div className="rating-modal-content">
        {/* Header */}
        <div className="rating-modal-header">
          <h2 className="rating-modal-title">Rate Your Experience</h2>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="rating-modal-close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="rating-modal-body">
          <p className="rating-modal-subtitle">
            How was your experience with <strong>{lawyerName}</strong>?
          </p>

          {/* Star Rating */}
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="rating-star-button"
                type="button"
                disabled={isSubmitting}
              >
                <Star
                  size={40}
                  className={`rating-star ${
                    star <= (hoverRating || rating) 
                      ? 'rating-star-filled' 
                      : 'rating-star-empty'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          {rating > 0 && (
            <p className="rating-label">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}

          {/* Comment Field */}
          <div className="rating-comment-box">
            <label htmlFor="comment" className="rating-comment-label">
              Add a comment (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your feedback about this lawyer..."
              className="rating-comment-input"
              rows="4"
              disabled={isSubmitting}
              maxLength="500"
            />
            <p className="rating-comment-count">
              {comment.length}/500
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rating-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rating-modal-footer">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rating-button rating-button-secondary"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="rating-button rating-button-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
