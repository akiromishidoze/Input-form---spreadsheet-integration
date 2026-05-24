import { useState } from 'react';

const PERSONAL_FIELDS = [
  { id: 'firstName', label: 'First Name', type: 'text', required: true },
  { id: 'lastName', label: 'Last Name', type: 'text', required: true },
  { id: 'email', label: 'Email', type: 'email', required: true },
  { id: 'phone', label: 'Phone', type: 'tel', attrs: { pattern: '[0-9+\\-\\s()]{7,15}', title: 'Enter a valid phone number' } },
  { id: 'dob', label: 'Date of Birth', type: 'date' },
];

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
  'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad',
  'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba',
  'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
  'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
  'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe',
];

const ADDRESS_FIELDS = [
  { id: 'street', label: 'Street', type: 'text', required: true },
  { id: 'city', label: 'City', type: 'text', required: true },
  { id: 'state', label: 'State', type: 'text' },
  { id: 'zip', label: 'ZIP Code', type: 'text', attrs: { pattern: '[0-9]{4,10}', title: 'Enter a valid ZIP code' } },
  { id: 'country', label: 'Country', type: 'select', options: COUNTRIES },
];

const ORDER_FIELDS = [
  { id: 'orderId', label: 'Order ID', type: 'text', required: true },
  { id: 'product', label: 'Product', type: 'text', required: true },
  { id: 'quantity', label: 'Quantity', type: 'number', attrs: { min: 1 } },
  { id: 'price', label: 'Price (₱)', type: 'number', attrs: { min: 0, step: 0.01 } },
  { id: 'orderDate', label: 'Order Date', type: 'date' },
  { id: 'orderStatus', label: 'Status', type: 'select', options: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
];

const ALL_FIELDS = [...PERSONAL_FIELDS, ...ADDRESS_FIELDS, ...ORDER_FIELDS];

export default function CustomerForm({ onSubmit, submitting }) {
  const init = () => ({
    ...Object.fromEntries(PERSONAL_FIELDS.map(f => [f.id, ''])),
    ...Object.fromEntries(ADDRESS_FIELDS.map(f => [f.id, f.id === 'country' ? 'Philippines' : ''])),
    ...Object.fromEntries(ORDER_FIELDS.map(f => [f.id, ''])),
  });

  const [data, setData] = useState(init);
  const [errors, setErrors] = useState({});

  const handleChange = (id, value) => {
    setData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const validate = () => {
    const errs = {};
    for (const f of ALL_FIELDS) {
      if (f.required && !data[f.id]) {
        errs[f.id] = `${f.label} is required`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit('Customer Details', data);
    setData(init());
    setErrors({});
  };

  const renderField = f => (
    <div className={`form-group${errors[f.id] ? ' has-error' : ''}`} key={f.id}>
      <label htmlFor={f.id}>
        {f.label}
        {f.required && <span className="required-star">*</span>}
      </label>
      {f.type === 'select' ? (
        <select
          id={f.id}
          required={f.required}
          value={data[f.id]}
          onChange={e => handleChange(f.id, e.target.value)}
        >
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
      {errors[f.id] && <span className="field-error">{errors[f.id]}</span>}
    </div>
  );

  return (
    <section className="tab-pane active">
      <h2>Customer Details</h2>
      <form onSubmit={handleSubmit} noValidate>
        <h3 className="form-section-title">Personal Details</h3>
        {PERSONAL_FIELDS.map(renderField)}

        <h3 className="form-section-title">Address</h3>
        {ADDRESS_FIELDS.map(renderField)}

        <h3 className="form-section-title">Order Info</h3>
        {ORDER_FIELDS.map(renderField)}

        <button type="submit" style={{ marginTop: '0.5rem' }} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </section>
  );
}
