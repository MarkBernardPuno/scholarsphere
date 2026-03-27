import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { CDBContainer } from 'cdbreact';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Chart = () => {
    const [data, setData] = useState({
        labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
        datasets: [
          {
            fill: false,
            lineTension: 0.1,
            backgroundColor: 'rgba(64, 64, 64, 0.5)',
            borderColor: 'rgba(64, 64, 64, 0)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(75,192,192,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(71, 225, 167, 0.5)',
            pointHoverBorderColor: 'rgb(71, 225, 167)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [1, 2, 7, 15, 27, 7],
          },
        ],
      });
    
      const options = {
        responsive: true,
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                const possibleValues = [0, 14, 28];
                if (possibleValues.includes(value)) {
                  return value;
                }
                return '';
              },
              stepSize: 14, 
            },
            suggestedMin: 0,
            suggestedMax: 28,
            grid: {
              display: false,
            },
          },
          x: {
            grid: {
              display: false, 
            },
          },
        },
      };

  return (
    <CDBContainer>
      <Bar 
        data={data} 
        options={options} 
      />
      <div style={{ textAlign: 'start', marginTop: '1rem' }}>
        <a 
          href="https://youtube.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: 'none', color: 'black' }}
        >
          Menchie Rosales
        </a>
        <br />
        <a 
          href="https://example.com/2" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: 'none', color: 'black' }}
        >
          Menchie Miranda
        </a>
        <br />
        <a 
          href="https://example.com/3" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: 'none', color: 'black' }}
        >
          Jonathan V. Taylar
        </a>
        <br />
        <a 
          href="https://example.com/4" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: 'none', color: 'black' }}
        >
          Ryan Francisco
        </a>
        <br />
        <a 
          href="https://example.com/5" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: 'none', color: 'black' }}
        >
          Verlyn Nojor
        </a>
        <br />
        <a 
          href="https://example.com/6" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: 'none', color: 'black' }}
        >
          Johnathan Richard Barrios
        </a>
      </div>
    </CDBContainer>
  );
};

export default Chart;
