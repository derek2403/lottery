import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [formData, setFormData] = useState({
    firstPrize: '',
    secondPrize: '',
    thirdPrize: '',
    specialPrize: Array(10).fill(''),
    consolationPrize: Array(10).fill('')
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
    
    // Check if there are any numbers entered
    const hasNumbers = formData.firstPrize || 
                      formData.secondPrize || 
                      formData.thirdPrize ||
                      formData.specialPrize.some(num => num) ||
                      formData.consolationPrize.some(num => num);

    // If numbers are entered, save them first
    if (hasNumbers) {
      const response = await fetch('/api/lottery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstPrize: formData.firstPrize,
          secondPrize: formData.secondPrize,
          thirdPrize: formData.thirdPrize,
          specialPrize: formData.specialPrize,
          consolationPrize: formData.consolationPrize
        })
      });

      if (response.ok) {
        await fetchPastRecords();
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    }

    // Get prediction regardless of whether new numbers were submitted
    try {
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
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Failed to get prediction');
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
          <h3>First Prize </h3>
          <input
            type="text"
            value={formData.firstPrize}
            onChange={(e) => handleInputChange('firstPrize', null, e.target.value)}
            maxLength={4}
            pattern="\d{0,4}"
          />
        </div>

        <div>
          <h3>Second Prize</h3>
          <input
            type="text"
            value={formData.secondPrize}
            onChange={(e) => handleInputChange('secondPrize', null, e.target.value)}
            maxLength={4}
            pattern="\d{0,4}"
          />
        </div>

        <div>
          <h3>Third Prize</h3>
          <input
            type="text"
            value={formData.thirdPrize}
            onChange={(e) => handleInputChange('thirdPrize', null, e.target.value)}
            maxLength={4}
            pattern="\d{0,4}"
          />
        </div>

        <div>
          <h3>Special Prize</h3>
          {formData.specialPrize.map((num, index) => (
            <input
              key={`special-${index}`}
              type="text"
              value={num}
              onChange={(e) => handleInputChange('specialPrize', index, e.target.value)}
              maxLength={4}
              pattern="\d{0,4}"
            />
          ))}
        </div>

        <div>
          <h3>Consolation Prize</h3>
          {formData.consolationPrize.map((num, index) => (
            <input
              key={`consolation-${index}`}
              type="text"
              value={num}
              onChange={(e) => handleInputChange('consolationPrize', index, e.target.value)}
              maxLength={4}
              pattern="\d{0,4}"
            />
          ))}
        </div>

        <button type="submit">Get Prediction</button>
      </form>

      {prediction && (
        <div className={styles.predictionContainer}>
          <h2>Prediction for Next Draw</h2>
          <div className={styles.predictionGrid}>
            <div className={styles.predictionSection}>
              <h3>First Prize</h3>
              <div className={styles.numberList}>
                <div className={styles.highProbability}>{prediction.firstPrize}</div>
              </div>
            </div>

            <div className={styles.predictionSection}>
              <h3>Second Prize</h3>
              <div className={styles.numberList}>
                <div className={styles.mediumProbability}>{prediction.secondPrize}</div>
              </div>
            </div>

            <div className={styles.predictionSection}>
              <h3>Third Prize</h3>
              <div className={styles.numberList}>
                <div className={styles.lowProbability}>{prediction.thirdPrize}</div>
              </div>
            </div>

            <div className={styles.predictionSection}>
              <h3>Special Prize</h3>
              <div className={styles.numberGrid}>
                {prediction.specialPrize.map((number, index) => (
                  <div key={`special-${index}`} className={styles.number}>
                    {number}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.predictionSection}>
              <h3>Consolation Prize</h3>
              <div className={styles.numberGrid}>
                {prediction.consolationPrize.map((number, index) => (
                  <div key={`consolation-${index}`} className={styles.number}>
                    {number}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.pastRecords}>
        <h2>Past Records</h2>
        <pre>{JSON.stringify(pastRecords, null, 2)}</pre>
      </div>
    </div>
  );
}
