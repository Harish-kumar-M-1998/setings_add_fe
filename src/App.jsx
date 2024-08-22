import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCode, FaChrome, FaPlay, FaStop, FaCog } from 'react-icons/fa'; // Import icons from react-icons
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import './App.css';

const serverUrl = 'http://localhost:2354'; // Use localhost or your server IP

const iconMap = {
  'VS Code': <FaCode size={60} />,
  'Chrome': <FaChrome size={60} />,
  'Zoom': <FaPlay size={60} />, // Use appropriate icon
  'Postman': <FaStop size={60} /> // Use appropriate icon
};

function Home() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    async function fetchApps() {
      try {
        const response = await axios.get(`${serverUrl}/apps`);
        setApps(response.data);
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    }

    fetchApps();
  }, []);

  const launchApp = async (appName) => {
    setLoading(true);
    setCurrentApp(appName);
    try {
      await axios.post(`${serverUrl}/launch`, { appName });
    } catch (error) {
      console.error('Error launching app:', error);
    } finally {
      setLoading(false);
    }
  };

  const quitApp = async () => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/quit`, { appName: currentApp });
      setCurrentApp(null);
    } catch (error) {
      console.error('Error quitting app:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {loading && <div className="loading">Loading...</div>}
      {currentApp && <button onClick={quitApp} className="quit-button">Quit App</button>}
      <div className="app-container">
        <div className="app-list">
          {apps.map((app) => (
            <div
              key={app.name}
              className="app-icon"
              onClick={() => launchApp(app.name)}
            >
              {iconMap[app.name] || <FaStop size={60} />} {/* Default icon if not found */}
              <span className="app-name">{app.name}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => navigate('/settings')} className="settings-button">
        <FaCog size={30} />
      </button>
    </div>
  );
}

function Settings() {
  const [file, setFile] = useState(null);
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    async function fetchApps() {
      try {
        const response = await axios.get(`${serverUrl}/apps`);
        setApps(response.data);
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    }

    fetchApps();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const addApp = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post(`${serverUrl}/add-app`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('Application added successfully!');
        setFile(null);
        // Refresh apps list
        const response = await axios.get(`${serverUrl}/apps`);
        setApps(response.data);
      } catch (error) {
        console.error('Error adding app:', error);
        setMessage('Error adding application.');
      }
    }
  };

  const removeApp = async (appName) => {
    try {
      await axios.post(`${serverUrl}/remove-app`, { appName });
      setMessage('Application removed successfully!');
      // Refresh apps list
      const response = await axios.get(`${serverUrl}/apps`);
      setApps(response.data);
    } catch (error) {
      console.error('Error removing app:', error);
      setMessage('Error removing application.');
    }
  };

  return (
    <div className="Settings">
      <h1>Settings</h1>
      <button onClick={() => navigate('/')} className="home-button">Home</button>
      <div className="settings-container">
        <div className="file-input">
          <input type="file" onChange={handleFileChange} />
          <button onClick={addApp}>Add Application</button>
        </div>
        <div className="app-list">
          {apps.map((app) => (
            <div key={app.name} className="app-item">
              <span>{app.name}</span>
              <button onClick={() => removeApp(app.name)}>Remove</button>
            </div>
          ))}
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
