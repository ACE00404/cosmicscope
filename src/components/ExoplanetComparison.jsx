import React from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const ExoplanetComparison = ({ planets }) => {
  // Create data for all planets in the comparison list
  const datasets = planets.map((planet, index) => {
    const color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
    return {
      label: planet.name,
      data: [
        {
          x: parseFloat(planet.radius),
          y: parseFloat(planet.mass)
        }
      ],
      backgroundColor: color,
      borderColor: 'lightblue',  // Light blue border
      borderWidth: 5,  // 5px border width
      pointRadius: 15,
      pointHoverRadius: 18,
      pointStyle: 'rectRounded',  // Use rounded rectangle shape
    };
  });

  const chartData = {
    datasets: datasets
  };

  const chartOptions = {
    scales: {
      x: { 
        title: { display: true, text: 'Radius (Earth radii)' },
        ticks: {
          padding: 15  // Add padding to x-axis ticks
        }
      },
      y: { 
        title: { display: true, text: 'Mass (Earth masses)' },
        ticks: {
          padding: 15  // Add padding to y-axis ticks
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const planet = planets[context.datasetIndex];
            return `${planet.name}: Radius: ${planet.radius}, Mass: ${planet.mass}`;
          }
        }
      }
    },
    layout: {
      padding: 20  // Add padding around the entire chart
    },
    maintainAspectRatio: false,  // Allow the chart to resize
    responsive: true
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <Scatter data={chartData} options={chartOptions} />
    </div>
  );
};

export default ExoplanetComparison;
