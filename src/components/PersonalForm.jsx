import { useState } from 'react';

const PERSONAL_FIELDS = [
  { id: 'firstName', label: 'First Name', type: 'text', required: true },
  { id: 'lastName', label: 'Last Name', type: 'text', required: true },
  { id: 'email', label: 'Email', type: 'email', required: true },
  { id: 'phone', label: 'Phone', type: 'tel' },
  { id: 'dob', label: 'Date of Birth', type: 'date' },
];

const ADDRESS_FIELDS = [
  { id: 'street', label: 'Street', type: 'text', required: true },
  { id: 'city', label: 'City', type: 'text', required: true },
  { id: 'state', label: 'State', type: 'text' },
  { id: 'zip', label: 'ZIP Code', type: 'text', attrs: { pattern: '[0-9]{5}', title: '5-digit ZIP' } },
  { id: 'country', label: 'Country', type: 'text' },
];

export default function PersonalForm({ onSubmit }) {
  const init = () => ({
    ...Object.fromEntries(PERSONAL_FIELDS.map(f => [f.id, ''])),
    ...Object.fromEntries(ADDRESS_FIELDS.map(f => [f.id, f.id === 'country' ? 'USA' : ''])),
  });

  const [data, setData] = useState(init);
  const handleChange = (id, value) => setData(prev => ({ ...prev, [id]: value }));

  const handleSubmit = e => {
    e.preventDefault();
    const missing = [...PERSONAL_FIELDS, ...ADDRESS_FIELDS].some(f => f.required && !data[f.id]);
    if (missing) {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit('Personal Info & Address', data);
    setData(init());
  };

  return (
    <section className="tab-pane active">
      <h2>Personal Information &amp; Address</h2>
      <form onSubmit={handleSubmit}>
        <h3 style={{ fontSize: '1rem', color: '#16213e', marginBottom: '0.75rem' }}>Personal Details</h3>
        {PERSONAL_FIELDS.map(f => (
          <div className="form-group" key={f.id}>
            <label htmlFor={f.id}>{f.label}</label>
            <input
              type={f.type}
              id={f.id}
              required={f.required}
              value={data[f.id]}
              onChange={e => handleChange(f.id, e.target.value)}
            />
          </div>
        ))}

        <h3 style={{ fontSize: '1rem', color: '#16213e', margin: '1.25rem 0 0.75rem' }}>Address</h3>
        {ADDRESS_FIELDS.map(f => (
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

        <button type="submit" style={{ marginTop: '0.5rem' }}>Submit</button>
      </form>
    </section>
  );
}
