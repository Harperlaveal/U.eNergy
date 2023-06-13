import React, { useState, useEffect } from "react";
import { EnergyProductionData } from "../interfaces";
import { Bar } from "react-chartjs-2";
import { CategoryScale, ChartType } from "chart.js";
import Chart from "chart.js/auto";

Chart.register(CategoryScale);

interface BarChartProps {
  data?: EnergyProductionData;
  max: number;
}

export default function BarChart({ data, max }: BarChartProps) {
  if (!data) {
    return null;
  }

  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [] as any[],
  });

  useEffect(() => {
    if (data) {
      setChartData({
        labels: data.production.map((p) => p.source),
        datasets: [
          {
            label: `Energy Production in ${data.year}`,
            data: data.production.map((p) => p.watts),
            backgroundColor: "rgba(75,192,192,0.6)",
            borderColor: "rgba(75,192,192,1)",
            borderWidth: 1,
          },
        ],
      });
    }
  }, [data]);

  const options = {
    indexAxis: "y" as "y",
    scales: {
      x: {
        title: {
          display: true,
          text: "Watts Produced",
        },
        barPercentage: 0.4,
        min: 0,
        max: max + 100,
      },
      y: {
        title: {
          display: true,
          text: "Energy Production Method",
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className="w-full h-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
