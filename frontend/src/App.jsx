import { useState } from 'react';
import axios from 'axios';
import { Leaf, Search, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import './index.css';

// Use environment variable for API URL or default to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/predict`, {
        text: inputText
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        'Failed to connect to the prediction server. Please ensure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Background elements */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <main className="main-content">
        <header className="header">
          <div className="logo-container">
            <Leaf className="logo-icon" />
            <h1>AI Ecofriendly Shopping Assistant</h1>
          </div>
          <p className="subtitle">Discover if a product is truly eco-friendly</p>
        </header>

        <div className="card glass-effect">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="input-group">
              <Search className="input-icon" />
              <input
                type="text"
                placeholder="Enter product title (e.g. Bamboo Toothbrush, Plastic Bottle)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="search-input"
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading || !inputText.trim()}
            >
              {loading ? <span className="spinner"></span> : 'Analyze'}
            </button>
          </form>

          {error && (
            <div className="error-message fade-in">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className={`result-container fade-in ${result.is_eco_friendly ? 'eco-positive' : 'eco-negative'}`}>
              <div className="result-header">
                {result.is_eco_friendly ? (
                  <CheckCircle2 className="result-icon success" size={48} />
                ) : (
                  <XCircle className="result-icon danger" size={48} />
                )}
                <h2>
                  {result.is_eco_friendly 
                    ? "Eco-Friendly Product" 
                    : "Not Eco-Friendly"}
                </h2>
              </div>
              
              <div className="result-details">
                <p>Based on our AI analysis, this product is categorized as <strong>{result.is_eco_friendly ? 'sustainable' : 'standard'}</strong>.</p>
                {result.confidence && (
                  <div className="confidence-meter">
                    <div className="meter-label">
                      <span>AI Confidence</span>
                      <span>{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="meter-bar">
                      <div 
                        className="meter-fill" 
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
