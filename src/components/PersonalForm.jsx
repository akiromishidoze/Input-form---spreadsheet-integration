import { useState } from 'react';

const FIELDS = [
  { id: 'firstName', label: 'First Name', type: 'text', required: true },
  { id: 'lastName', label: 'Last Name', type: 'text', required: true },
  { id: 'email', label: 'Email', type: 'email', required: true },
  { id: 'phone', label: 'Phone', type: 'tel' },
  { id: 'dob', label: 'Date of Birth', type: 'date' },
];

export default function PersonalForm({ onSubmit }) {
  const [data, setData] = useState(() =>
    Object.fromEntries(FIELDS.map(f => [f.id, '']))
  );

  const handleChange = (id, value) => setData(prev => ({ ...prev, [id]: value }));

  const handleSubmit = e => {
    e.preventDefault();
    const missing = FIELDS.some(f => f.required && !data[f.id]);
    if (missing) {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit('Personal Info', data);
    setData(Object.fromEntries(FIELDS.map(f => [f.id, ''])));
  };

  return (
    <section className="tab-pane active">
      <h2>Personal Information</h2>
      <form onSubmit={handleSubmit}>
        {FIELDS.map(f => (
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
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
