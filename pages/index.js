import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [formData, setFormData] = useState({
    firstPrize: '',
    secondPrize: '',
    thirdPrize: '',
    specialPrize: ['', '', '', '', '', '', '', '', '', ''],
    consolationPrize: ['', '', '', '', '', '', '', '', '', '']
  });
  const [pastRecords, setPastRecords] = useState([]);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    fetchPastRecords();
  }, []);

  const fetchPastRecords = async () => {
    const response = await fetch('/api/lottery');
    const data = await response.json();
    if (data.success) {
      setPastRecords(data.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save the current numbers
    const response = await fetch('/api/lottery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      fetchPastRecords();
      
      // Get prediction
      const predictionResponse = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pastNumbers: pastRecords })
      });

      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json();
        setPrediction(predictionData);
      }
    }
  };

  const handleInputChange = (field, index, value) => {
    if (field === 'firstPrize' || field === 'secondPrize' || field === 'thirdPrize') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].map((num, i) => i === index ? value : num)
      }));
    }
  };

  return (
    <div className={styles.container}>
      <h1>Lottery Number Prediction</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <h3>First Prize</h3>
          <input
            type="text"
            value={formData.firstPrize}
            onChange={(e) => handleInputChange('firstPrize', null, e.target.value)}
            maxLength={4}
            pattern="\d{4}"
            required
          />
        </div>

        <div>
          <h3>Second Prize</h3>
          <input
            type="text"
            value={formData.secondPrize}
            onChange={(e) => handleInputChange('secondPrize', null, e.target.value)}
            maxLength={4}
            pattern="\d{4}"
            required
          />
        </div>

        <div>
          <h3>Third Prize</h3>
          <input
            type="text"
            value={formData.thirdPrize}
            onChange={(e) => handleInputChange('thirdPrize', null, e.target.value)}
            maxLength={4}
            pattern="\d{4}"
            required
          />
        </div>

        <div>
          <h3>Special Prize (10 numbers)</h3>
          {formData.specialPrize.map((num, index) => (
            <input
              key={`special-${index}`}
              type="text"
              value={num}
              onChange={(e) => handleInputChange('specialPrize', index, e.target.value)}
              maxLength={4}
              pattern="\d{4}"
              required
            />
          ))}
        </div>

        <div>
          <h3>Consolation Prize (10 numbers)</h3>
          {formData.consolationPrize.map((num, index) => (
            <input
              key={`consolation-${index}`}
              type="text"
              value={num}
              onChange={(e) => handleInputChange('consolationPrize', index, e.target.value)}
              maxLength={4}
              pattern="\d{4}"
              required
            />
          ))}
        </div>

        <button type="submit">Submit and Get Prediction</button>
      </form>

      {prediction && (
        <div>
          <h2>Prediction for Next Draw</h2>
          <pre>{JSON.stringify(prediction, null, 2)}</pre>
        </div>
      )}

      <div>
        <h2>Past Records</h2>
        <pre>{JSON.stringify(pastRecords, null, 2)}</pre>
      </div>
    </div>
  );
}
