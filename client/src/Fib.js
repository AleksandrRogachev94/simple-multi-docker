import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default () => {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');
  useEffect(() => {
    const fetch = async () => {
      const values = await axios.get('/api/values/current');
      setValues(values.data);
      const seenIndexes = await axios.get('/api/values/all');
      setSeenIndexes(seenIndexes.data);
    }
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/values', { index });
    setIndex('');
  };

  const renderSeenIndexes = seenIndexes.map(({ number }) => number).join(',  ');
  const renderValues = Object.entries(values).map(([key, val]) => (
    <div key={key}>For index {key} I calculated {val}</div>
  ));

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your index
          <input value={index} onChange={e => setIndex(e.target.value)} />
          <button>Submit</button>
        </label>
      </form>

      <h3>Indexes I have seen:</h3>
      {renderSeenIndexes}
      <h3>Calculated values</h3>
      {renderValues}
    </div>
  );
}