import React, { useEffect, useState } from 'react';

const ExoplanetSelector = ({ onExoplanetSelect }) => {
  const [exoplanets, setExoplanets] = useState([]);
  const [loading, setLoading] = useState(true);  // For handling loading state
  const [error, setError] = useState(null);      // For handling errors

  // Fetch exoplanet data from the alternative API when the component mounts
  useEffect(() => {
    fetch('http://simbad.u-strasbg.fr/simbad/sim-tap')  // Alternative API
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Filter the data to only include planets
        const filteredPlanets = data.bodies.filter(body => body.isPlanet);  // Filter for planets
        setExoplanets(filteredPlanets);  // Set the filtered planets in state
        setLoading(false);    // Disable loading state
      })
      .catch(error => {
        console.error('Error fetching exoplanet data:', error);
        setError(error.message);  // Set the error message
        setLoading(false);        // Disable loading state
      });
  }, []);  // The empty dependency array ensures this runs only once when the component mounts

  if (loading) {
    return <p>Loading exoplanets...</p>;  // Show loading message
  }

  if (error) {
    return <p>Error: {error}</p>;  // Show error message if the fetch failed
  }

  return (
    <div>
      <h2>Select an Exoplanet</h2>
      <select onChange={(e) => onExoplanetSelect(e.target.value)}>
        <option value="">-- Select a Planet --</option>
        {exoplanets.map((planet, index) => (
          <option key={index} value={planet.englishName}>
            {planet.englishName} - ({planet.semimajorAxis} km from Sun)
          </option>
        ))}
      </select>
    </div>
  );
};

export default ExoplanetSelector;
