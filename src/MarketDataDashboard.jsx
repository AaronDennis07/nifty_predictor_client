import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Database, BarChart3 } from 'lucide-react';

const API_BASE = 'https://nifty-predictor-server.onrender.com';

export default function MarketDataDashboard() {
  const [activeTab, setActiveTab] = useState('view');
  const [niftyData, setNiftyData] = useState(null);
  const [vixData, setVixData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [niftyForm, setNiftyForm] = useState({
    Date: '',
    Open: '',
    High: '',
    Low: '',
    Close: '',
    'Shares Traded': '',
    'Turnover (₹ Cr)': ''
  });

  const [vixForm, setVixForm] = useState({
    Date: '',
    Open: '',
    High: '',
    Low: '',
    Close: '',
    'Prev. Close': ''
  });

  const [viewParams, setViewParams] = useState({
    symbol: 'nifty',
    days: 30,
    from_: 'end'
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = viewParams.symbol === 'nifty' ? '/data/nifty' : '/data/vix';
      const res = await fetch(`${API_BASE}${endpoint}?days=${viewParams.days}&from_=${viewParams.from_}`);
      const data = await res.json();
      
      if (viewParams.symbol === 'nifty') {
        setNiftyData(data);
        setVixData(null);
      } else {
        setVixData(data);
        setNiftyData(null);
      }
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    }
    setLoading(false);
  };

  const fetchPrediction = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/predict`);
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      setError('Failed to fetch prediction: ' + err.message);
    }
    setLoading(false);
  };

  const submitNiftyData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/feed/nifty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([niftyForm])
      });
      const data = await res.json();
      alert(`Success! ${data.rows_inserted} row(s) inserted`);
      setNiftyForm({
        Date: '',
        Open: '',
        High: '',
        Low: '',
        Close: '',
        'Shares Traded': '',
        'Turnover (₹ Cr)': ''
      });
    } catch (err) {
      setError('Failed to submit: ' + err.message);
    }
    setLoading(false);
  };

  const submitVixData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/feed/vix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([vixForm])
      });
      const data = await res.json();
      alert(`Success! ${data.rows_inserted} row(s) inserted`);
      setVixForm({
        Date: '',
        Open: '',
        High: '',
        Low: '',
        Close: '',
        'Prev. Close': ''
      });
    } catch (err) {
      setError('Failed to submit: ' + err.message);
    }
    setLoading(false);
  };

  const chartData = niftyData?.data || vixData?.data || [];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <Activity size={40} color="#60a5fa" />
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', margin: 0 }}>Market Data Feed</h1>
          </div>
          <p style={{ color: '#94a3b8', margin: 0 }}>Real-time NIFTY & VIX Data Management</p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '8px' }}>
          {[
            { id: 'view', label: 'View Data', Icon: BarChart3 },
            { id: 'predict', label: 'Predictions', Icon: TrendingUp },
            { id: 'feed', label: 'Feed Data', Icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backgroundColor: activeTab === tab.id ? '#2563eb' : '#334155',
                color: activeTab === tab.id ? 'white' : '#cbd5e1',
                fontWeight: activeTab === tab.id ? '600' : '400'
              }}
            >
              <tab.Icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(127, 29, 29, 0.3)', border: '1px solid #991b1b', borderRadius: '8px', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {/* View Data Tab */}
        {activeTab === 'view' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Query Market Data</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <select
                  value={viewParams.symbol}
                  onChange={(e) => setViewParams({...viewParams, symbol: e.target.value})}
                  style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', borderRadius: '8px', border: '1px solid #475569' }}
                >
                  <option value="nifty">NIFTY</option>
                  <option value="vix">INDIA VIX</option>
                </select>
                <input
                  type="number"
                  value={viewParams.days}
                  onChange={(e) => setViewParams({...viewParams, days: e.target.value})}
                  placeholder="Days"
                  style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', borderRadius: '8px', border: '1px solid #475569' }}
                />
                <select
                  value={viewParams.from_}
                  onChange={(e) => setViewParams({...viewParams, from_: e.target.value})}
                  style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', borderRadius: '8px', border: '1px solid #475569' }}
                >
                  <option value="end">From End</option>
                  <option value="start">From Start</option>
                </select>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  style={{
                    padding: '8px 24px',
                    backgroundColor: loading ? '#1e40af' : '#2563eb',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Loading...' : 'Fetch Data'}
                </button>
              </div>
            </div>

            {(niftyData || vixData) && (
              <>
                <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Price Chart</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="Date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #475569'}} />
                      <Legend />
                      <Line type="monotone" dataKey="Open" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="High" stroke="#10b981" />
                      <Line type="monotone" dataKey="Low" stroke="#ef4444" />
                      <Line type="monotone" dataKey="Close" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', overflowX: 'auto' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Data Table</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '14px', textAlign: 'left', color: '#cbd5e1', borderCollapse: 'collapse' }}>
                      <thead style={{ fontSize: '12px', textTransform: 'uppercase', backgroundColor: '#334155', color: '#94a3b8' }}>
                        <tr>
                          {Object.keys(chartData[0] || {}).map(key => (
                            <th key={key} style={{ padding: '12px 16px' }}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.slice(0, 10).map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                            {Object.values(row).map((val, j) => (
                              <td key={j} style={{ padding: '12px 16px' }}>{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {chartData.length > 10 && (
                    <p style={{ color: '#94a3b8', marginTop: '16px', textAlign: 'center' }}>Showing 10 of {chartData.length} rows</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predict' && (
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Market Predictions</h2>
            <button
              onClick={fetchPrediction}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? 'linear-gradient(90deg, #1e40af 0%, #6b21a8 100%)' : 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                marginBottom: '24px',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Generating...' : 'Run Prediction'}
            </button>

            {prediction && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Header Card */}
                <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <p style={{ color: '#e0e7ff', fontSize: '14px', margin: '0 0 4px 0' }}>Signal Date</p>
                      <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{prediction.signal_date}</p>
                    </div>
                    <div>
                      <p style={{ color: '#e0e7ff', fontSize: '14px', margin: '0 0 4px 0' }}>Trade Date</p>
                      <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{prediction.trade_date}</p>
                    </div>
                    <div>
                      <p style={{ color: '#e0e7ff', fontSize: '14px', margin: '0 0 4px 0' }}>Spot Close</p>
                      <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>₹{prediction.spot_close?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Volatility Metrics */}
                <div style={{ backgroundColor: '#334155', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Activity size={20} color="#60a5fa" />
                    <h3 style={{ color: '#cbd5e1', fontSize: '16px', margin: 0 }}>Volatility</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px 0' }}>Predicted Volatility</p>
                      <p style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{(prediction.predicted_volatility * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px 0' }}>India VIX</p>
                      <p style={{ color: '#60a5fa', fontSize: '24px', fontWeight: '600', margin: 0 }}>{prediction.india_vix}</p>
                    </div>
                  </div>
                </div>

                {/* Market Probability */}
                <div style={{ backgroundColor: '#334155', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <BarChart3 size={20} color="#f59e0b" />
                    <h3 style={{ color: '#cbd5e1', fontSize: '16px', margin: 0 }}>Probability</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: '500' }}>Bull</span>
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>{(prediction.bull_probability * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${prediction.bull_probability * 100}%`, height: '100%', backgroundColor: '#4ade80', transition: 'width 0.5s' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#f87171', fontSize: '14px', fontWeight: '500' }}>Bear</span>
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>{(prediction.bear_probability * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${prediction.bear_probability * 100}%`, height: '100%', backgroundColor: '#f87171', transition: 'width 0.5s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Regime */}
                <div style={{ backgroundColor: '#334155', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <TrendingDown size={20} color="#a78bfa" />
                    <h3 style={{ color: '#cbd5e1', fontSize: '16px', margin: 0 }}>Market Regime</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', backgroundColor: prediction.vol_regime === 'RISING_VOL' ? '#7c2d12' : '#065f46', borderRadius: '8px', border: `2px solid ${prediction.vol_regime === 'RISING_VOL' ? '#ea580c' : '#10b981'}` }}>
                      <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px 0' }}>Volatility Regime</p>
                      <p style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{prediction.vol_regime.replace('_', ' ')}</p>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: prediction.direction_regime === 'BEARISH' ? '#7c2d12' : '#065f46', borderRadius: '8px', border: `2px solid ${prediction.direction_regime === 'BEARISH' ? '#f87171' : '#4ade80'}` }}>
                      <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px 0' }}>Direction Regime</p>
                      <p style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{prediction.direction_regime}</p>
                    </div>
                  </div>
                </div>

                {/* Trading Strategy */}
                <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', padding: '24px', borderRadius: '12px', boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <TrendingUp size={28} color="white" />
                    <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Recommended Strategy</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '8px' }}>
                      <p style={{ color: '#fca5a5', fontSize: '12px', margin: '0 0 6px 0' }}>Strategy Type</p>
                      <p style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{prediction.strategy.replace('_', ' ')}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '8px' }}>
                      <p style={{ color: '#fca5a5', fontSize: '12px', margin: '0 0 6px 0' }}>Expiry Type</p>
                      <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{prediction.expiry.type}</p>
                      <p style={{ color: '#fecaca', fontSize: '14px', margin: '4px 0 0 0' }}>{prediction.expiry.date}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '8px' }}>
                      <p style={{ color: '#fca5a5', fontSize: '12px', margin: '0 0 6px 0' }}>Strike Price</p>
                      {Object.entries(prediction.strikes).map(([action, strike]) => (
                        <div key={action} style={{ marginBottom: '4px' }}>
                          <span style={{ color: '#fecaca', fontSize: '14px' }}>{action.replace('_', ' ')}: </span>
                          <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>₹{strike}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feed Data Tab */}
        {activeTab === 'feed' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* NIFTY Form */}
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={24} color="#4ade80" />
                Feed NIFTY Data
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.keys(niftyForm).map(key => (
                  <input
                    key={key}
                    type={key === 'Date' ? 'text' : 'number'}
                    step="any"
                    placeholder={`${key} ${key === 'Date' ? '(DD-MM-YYYY)' : ''}`}
                    value={niftyForm[key]}
                    onChange={(e) => setNiftyForm({...niftyForm, [key]: e.target.value})}
                    required
                    style={{ width: '100%', padding: '8px 16px', backgroundColor: '#334155', color: 'white', borderRadius: '8px', border: '1px solid #475569' }}
                  />
                ))}
                <button
                  onClick={submitNiftyData}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: loading ? '#15803d' : '#16a34a',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  Submit NIFTY Data
                </button>
              </div>
            </div>

            {/* VIX Form */}
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown size={24} color="#f87171" />
                Feed VIX Data
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.keys(vixForm).map(key => (
                  <input
                    key={key}
                    type={key === 'Date' ? 'text' : 'number'}
                    step="any"
                    placeholder={`${key} ${key === 'Date' ? '(DD-MM-YYYY)' : ''}`}
                    value={vixForm[key]}
                    onChange={(e) => setVixForm({...vixForm, [key]: e.target.value})}
                    required
                    style={{ width: '100%', padding: '8px 16px', backgroundColor: '#334155', color: 'white', borderRadius: '8px', border: '1px solid #475569' }}
                  />
                ))}
                <button
                  onClick={submitVixData}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: loading ? '#b91c1c' : '#dc2626',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  Submit VIX Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}