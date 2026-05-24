export default function SpreadsheetView({ entries, onDelete, onClearAll, onExportCsv }) {
  return (
    <section className="tab-pane active">
      <h2>All Entries</h2>

      <div className="spreadsheet-controls">
        <button onClick={onExportCsv}>Export CSV</button>
        <button className="danger" onClick={onClearAll}>Clear All Data</button>
      </div>

      <div className="table-wrapper">
        <table id="dataTable">
          <thead>
            <tr>
              <th>Form</th>
              <th>Data</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            {!entries.length ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>No entries yet.</td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.form}</td>
                  <td>
                    {Object.entries(entry.data).map(([k, v]) => {
                      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                      const value = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v || '\u2014';
                      return <div key={k}><strong>{label}:</strong> {value}</div>;
                    })}
                  </td>
                  <td>{new Date(entry.submitted).toLocaleString()}</td>
                  <td>
                    <button className="delete-btn" onClick={() => onDelete(entry.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
