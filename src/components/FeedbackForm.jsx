import { useState } from 'react';
import StarRating from './StarRating';

const CATEGORIES = ['Product', 'Service', 'Support', 'General'];

export default function FeedbackForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [comments, setComments] = useState('');
  const [consent, setConsent] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!rating) {
      alert('Please select a rating.');
      return;
    }
    onSubmit('Feedback', { rating: String(rating), category, comments, contactConsent: consent });
    setRating(0);
    setCategory('');
    setComments('');
    setConsent(false);
  };

  return (
    <section className="tab-pane active">
      <h2>Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating</label>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">-- Select --</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="comments">Comments</label>
          <textarea id="comments" rows="4" value={comments} onChange={e => setComments(e.target.value)} />
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
            May we contact you about this feedback?
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
