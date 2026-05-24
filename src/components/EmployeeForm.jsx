import { useState } from 'react';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];

const FIELDS = [
  { id: 'empId', label: 'Employee ID', type: 'text', required: true },
  { id: 'department', label: 'Department', type: 'select', options: DEPARTMENTS, required: true },
  { id: 'position', label: 'Position', type: 'text', required: true },
  { id: 'salary', label: 'Salary ($)', type: 'number', attrs: { min: 0, step: 100 } },
  { id: 'startDate', label: 'Start Date', type: 'date' },
];

export default function EmployeeForm({ onSubmit }) {
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
    onSubmit('Employee', data);
    setData(Object.fromEntries(FIELDS.map(f => [f.id, ''])));
  };

  return (
    <section className="tab-pane active">
      <h2>Employee Details</h2>
      <form onSubmit={handleSubmit}>
        {FIELDS.map(f => (
          <div className="form-group" key={f.id}>
            <label htmlFor={f.id}>{f.label}</label>
            {f.type === 'select' ? (
              <select
                id={f.id}
                required={f.required}
                value={data[f.id]}
                onChange={e => handleChange(f.id, e.target.value)}
              >
                <option value="">-- Select --</option>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type}
                id={f.id}
                required={f.required}
                {...f.attrs}
                value={data[f.id]}
                onChange={e => handleChange(f.id, e.target.value)}
              />
            )}
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
