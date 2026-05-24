import { useState } from 'react';

const FIELDS = [
  { id: 'street', label: 'Street', type: 'text', required: true },
  { id: 'city', label: 'City', type: 'text', required: true },
  { id: 'state', label: 'State', type: 'text' },
  { id: 'zip', label: 'ZIP Code', type: 'text', attrs: { pattern: '[0-9]{5}', title: '5-digit ZIP' } },
  { id: 'country', label: 'Country', type: 'text' },
];

export default function AddressForm({ onSubmit }) {
  const [data, setData] = useState(() => ({
    street: '', city: '', state: '', zip: '', country: 'USA',
  }));

  const handleChange = (id, value) => setData(prev => ({ ...prev, [id]: value }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!data.street || !data.city) {
      alert('Street and City are required.');
      return;
    }
    onSubmit('Address', data);
    setData({ street: '', city: '', state: '', zip: '', country: 'USA' });
  };

  return (
    <section className="tab-pane active">
      <h2>Address Information</h2>
      <form onSubmit={handleSubmit}>
        {FIELDS.map(f => (
          <div className="form-group" key={f.id}>
            <label htmlFor={f.id}>{f.label}</label>
            <input
              type={f.type}
              id={f.id}
              required={f.required}
              {...f.attrs}
              value={data[f.id]}
              onChange={e => handleChange(f.id, e.target.value)}
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
