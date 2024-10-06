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

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const ExoplanetScatterPlot = ({ selectedPlanet }) => {
  const chartData = {
    datasets: [
      {
        label: selectedPlanet.name,
        data: [
          {
            x: parseFloat(selectedPlanet.radius),
            y: parseFloat(selectedPlanet.mass)
          }
        ],
        backgroundColor: 'rgba(255, 255, 255, 0.7)'  // Light color for data points
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: { 
        title: { display: true, text: 'Radius (Earth radii)', color: 'rgba(255, 255, 255, 0.7)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: { 
        title: { display: true, text: 'Mass (Earth masses)', color: 'rgba(255, 255, 255, 0.7)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.7)'  // Light color for legend text
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)'
      }
    }
  };

  return <Scatter data={chartData} options={chartOptions} />;
};

export default ExoplanetScatterPlot;
