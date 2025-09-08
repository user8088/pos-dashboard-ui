// Chakra imports
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import ReactApexChart from "react-apexcharts";

const StockValueChart = ({ timePeriod, customDateRange }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");

  // Sample data for different time periods
  const getChartData = (period) => {
    switch (period) {
      case "Today":
        return [
          { time: "00:00", stockValue: 3000 },
          { time: "04:00", stockValue: 5500 },
          { time: "08:00", stockValue: 4800 },
          { time: "12:00", stockValue: 8500 },
          { time: "16:00", stockValue: 12200 },
          { time: "20:00", stockValue: 18000 },
          { time: "24:00", stockValue: 15000 }
        ];
      case "Week":
        return [
          { day: "Mon", stockValue: 25000 },
          { day: "Tue", stockValue: 32000 },
          { day: "Wed", stockValue: 28000 },
          { day: "Thu", stockValue: 35000 },
          { day: "Fri", stockValue: 42000 },
          { day: "Sat", stockValue: 38000 },
          { day: "Sun", stockValue: 45000 }
        ];
      case "Month":
        return [
          { week: "Week 1", stockValue: 125000 },
          { week: "Week 2", stockValue: 142000 },
          { week: "Week 3", stockValue: 118000 },
          { week: "Week 4", stockValue: 165000 }
        ];
      case "Seasonal":
        return [
          { month: "Mar", stockValue: 550000 },
          { month: "Apr", stockValue: 580000 },
          { month: "May", stockValue: 620000 },
          { month: "Jun", stockValue: 650000 },
          { month: "Jul", stockValue: 680000 },
          { month: "Aug", stockValue: 720000 },
          { month: "Sep", stockValue: 690000 },
          { month: "Oct", stockValue: 660000 }
        ];
      case "Year":
        return [
          { month: "Jan", stockValue: 480000 },
          { month: "Feb", stockValue: 520000 },
          { month: "Mar", stockValue: 550000 },
          { month: "Apr", stockValue: 580000 },
          { month: "May", stockValue: 620000 },
          { month: "Jun", stockValue: 650000 },
          { month: "Jul", stockValue: 680000 },
          { month: "Aug", stockValue: 720000 },
          { month: "Sep", stockValue: 690000 },
          { month: "Oct", stockValue: 660000 },
          { month: "Nov", stockValue: 630000 },
          { month: "Dec", stockValue: 700000 }
        ];
      case "Custom date":
        if (customDateRange?.startDate && customDateRange?.endDate) {
          // Calculate days between start and end date
          const start = new Date(customDateRange.startDate);
          const end = new Date(customDateRange.endDate);
          const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          
          // Generate daily data for the custom range
          const customData = [];
          for (let i = 0; i <= daysDiff; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const stockValue = Math.floor(Math.random() * 80000) + 30000; // Random stock value between 30K-110K
            customData.push({ date: dateStr, stockValue });
          }
          return customData;
        }
        return [
          { time: "00:00", stockValue: 3000 },
          { time: "04:00", stockValue: 5500 },
          { time: "08:00", stockValue: 4800 },
          { time: "12:00", stockValue: 8500 },
          { time: "16:00", stockValue: 12200 },
          { time: "20:00", stockValue: 18000 },
          { time: "24:00", stockValue: 15000 }
        ];
      default:
        return [
          { time: "00:00", stockValue: 3000 },
          { time: "04:00", stockValue: 5500 },
          { time: "08:00", stockValue: 4800 },
          { time: "12:00", stockValue: 8500 },
          { time: "16:00", stockValue: 12200 },
          { time: "20:00", stockValue: 18000 },
          { time: "24:00", stockValue: 15000 }
        ];
    }
  };

  const chartData = getChartData(timePeriod);
  const xAxisKey = timePeriod === "Today" ? "time" : timePeriod === "Week" ? "day" : timePeriod === "Month" ? "week" : timePeriod === "Seasonal" ? "month" : timePeriod === "Custom date" ? "date" : "month";

  const series = [
    {
      name: "Stock Value",
      data: chartData.map(item => item.stockValue)
    }
  ];

  const options = {
    chart: {
      type: "area",
      toolbar: {
        show: false
      },
      dropShadow: {
        enabled: true,
        top: 13,
        left: 0,
        blur: 10,
        opacity: 0.1,
        color: "#FF8D28"
      }
    },
    colors: ["#FF8D28"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.1,
        gradientToColors: ["#FF8D28"],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    xaxis: {
      categories: chartData.map(item => item[xAxisKey]),
      labels: {
        style: {
          colors: textColor,
          fontSize: "12px",
          fontWeight: "500"
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: textColor,
          fontSize: "12px",
          fontWeight: "500"
        },
        formatter: function (value) {
          return `${(value / 1000).toFixed(0)}K`;
        }
      }
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    tooltip: {
      theme: useColorModeValue("light", "dark"),
      y: {
        formatter: function (value) {
          return `PKR. ${value.toLocaleString()}`;
        }
      }
    },
    legend: {
      show: false
    }
  };

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)")}>
      <CardHeader>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Stock Value Trend
        </Text>
        <Text fontSize='sm' color='gray.500'>
          March 15 - October 21
        </Text>
      </CardHeader>
      <CardBody>
        <Box h='400px' w='100%'>
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height="100%"
          />
        </Box>
      </CardBody>
    </Card>
  );
};

export default StockValueChart;
