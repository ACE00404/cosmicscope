import React, { useState, useCallback, Suspense, lazy, useEffect } from 'react';
import exoplanetData from '../data/exoplanets.json';
import StarrySky from './StarrySky';  // Regular import
import Exoplanet3D from './Exoplanet3D';  // Updated import

// Lazy load the heavy components
const ExoplanetScatterPlot = lazy(() => import('./ExoplanetScatterPlot'));

const Dashboard = () => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [comparisonList, setComparisonList] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState(null);
  const [visualizationError, setVisualizationError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [userConstellations, setUserConstellations] = useState([]);

  useEffect(() => {
    try {
      console.log('Exoplanet data:', exoplanetData);
      if (exoplanetData && exoplanetData.length > 0) {
        setSelectedPlanet(exoplanetData[0]);
      } else {
        throw new Error('No exoplanet data available');
      }
    } catch (err) {
      console.error('Error in Dashboard useEffect:', err);
      setError(err.message);
    }
  }, []);

  const handlePlanetSelect = useCallback((event) => {
    try {
      const selected = exoplanetData.find(planet => planet.name === event.target.value);
      if (selected) {
        setSelectedPlanet(selected);
      } else {
        throw new Error('Selected planet not found');
      }
    } catch (err) {
      console.error('Error in handlePlanetSelect:', err);
      setError(err.message);
    }
  }, []);

  const handleAddToComparison = () => {
    if (!comparisonList.includes(selectedPlanet)) {
      setComparisonList([...comparisonList, selectedPlanet]);
      setNotification(`${selectedPlanet.name} added to comparison`);
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification(`${selectedPlanet.name} is already in the comparison list`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCompare = () => {
    setIsComparing(true);
  };

  const handleClearComparison = () => {
    setComparisonList([]);
    setIsComparing(false);
  };

  const handleVisualizationError = (error) => {
    console.error('Visualization error:', error);
    setVisualizationError('Failed to load 3D visualization. Please try again later.');
  };

  const handleSaveConstellation = (newConstellation) => {
    setUserConstellations([...userConstellations, newConstellation]);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!selectedPlanet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      <div className="view-selector">
        <label htmlFor="planet-select">Select a Planet: </label>
        <select id="planet-select" onChange={handlePlanetSelect}>
          {exoplanetData.map((planet, index) => (
            <option key={index} value={planet.name}>
              {planet.name}
            </option>
          ))}
        </select>

        <button onClick={handleAddToComparison}>Add to Comparison</button>
      </div>

      {/* Planet details */}
      <div className="planet-info">
        <h2>{selectedPlanet.name}</h2>
        <p>Mass: {selectedPlanet.mass}</p>
        <p>Radius: {selectedPlanet.radius}</p>
        <p>Orbital Period: {selectedPlanet.orbital_period}</p>
        <p>Discovery Year: {selectedPlanet.discovered}</p>
        <p>Distance: {selectedPlanet.distance}</p>
      </div>

      {/* Single planet or comparison mode */}
      {!isComparing && (
        <Suspense fallback={<div>Loading Visualizations...</div>}>
          <div className="single-planet-visualizations">
            <h3>Single Planet 2D Visualization (Mass vs Radius)</h3>
            <ExoplanetScatterPlot selectedPlanet={selectedPlanet} />
            <h3>Single Planet 3D Model</h3>
            {visualizationError ? (
              <div>{visualizationError}</div>
            ) : (
              <ErrorBoundary onError={handleVisualizationError}>
                <Exoplanet3D 
                  selectedPlanet={selectedPlanet} 
                  userConstellations={userConstellations}
                />
              </ErrorBoundary>
            )}
          </div>

          <h3>Starry Sky from {selectedPlanet.name}</h3>
          <div className="starry-sky-container" style={{ width: '100%', height: '80vh', minHeight: '600px' }}>
            <ErrorBoundary onError={handleVisualizationError}>
              <StarrySky 
                selectedPlanet={selectedPlanet} 
                userConstellations={userConstellations}
                onSaveConstellation={handleSaveConstellation}
              />
            </ErrorBoundary>
          </div>
        </Suspense>
      )}

      {comparisonList.length > 0 && (
        <div className="comparison-list">
          <h3>Planets in Comparison</h3>
          <ul>
            {comparisonList.map((planet, index) => (
              <li key={index}>{planet.name}</li>
            ))}
          </ul>
          {comparisonList.length > 1 && (
            <button onClick={handleCompare}>Compare Planets</button>
          )}
          <button onClick={handleClearComparison}>Clear Comparison</button>
        </div>
      )}

      {isComparing && comparisonList.length > 1 && (
        <div className="comparison-mode">
          <h3>Planet Comparison</h3>
          <div className="visualization-comparison">
            {comparisonList.map((planet, index) => (
              <Suspense fallback={<div>Loading Comparison...</div>} key={index}>
                <div className="planet-comparison">
                  <Exoplanet3D selectedPlanet={planet} />
                  <ExoplanetScatterPlot selectedPlanet={planet} />
                </div>
              </Suspense>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Add this ErrorBoundary component at the end of the file
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with this component.</div>;
    }

    return this.props.children;
  }
}

export default Dashboard;
