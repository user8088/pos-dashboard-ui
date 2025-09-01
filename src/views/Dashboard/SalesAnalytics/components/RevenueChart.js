// Chakra imports
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import ReactApexChart from "react-apexcharts";

const RevenueChart = ({ timePeriod, customDateRange }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");

  // Sample data for different time periods
  const getChartData = (period) => {
    switch (period) {
      case "Today":
        return [
          { time: "00:00", revenue: 2000 },
          { time: "04:00", revenue: 3500 },
          { time: "08:00", revenue: 2800 },
          { time: "12:00", revenue: 6500 },
          { time: "16:00", revenue: 8200 },
          { time: "20:00", revenue: 12000 },
          { time: "24:00", revenue: 8000 }
        ];
      case "Week":
        return [
          { day: "Mon", revenue: 15000 },
          { day: "Tue", revenue: 22000 },
          { day: "Wed", revenue: 18000 },
          { day: "Thu", revenue: 25000 },
          { day: "Fri", revenue: 32000 },
          { day: "Sat", revenue: 28000 },
          { day: "Sun", revenue: 35000 }
        ];
      case "Month":
        return [
          { week: "Week 1", revenue: 85000 },
          { week: "Week 2", revenue: 92000 },
          { week: "Week 3", revenue: 78000 },
          { week: "Week 4", revenue: 105000 }
        ];
      case "Business Season":
        return [
          { month: "Mar", revenue: 350000 },
          { month: "Apr", revenue: 380000 },
          { month: "May", revenue: 420000 },
          { month: "Jun", revenue: 450000 },
          { month: "Jul", revenue: 480000 },
          { month: "Aug", revenue: 520000 },
          { month: "Sep", revenue: 490000 },
          { month: "Oct", revenue: 460000 },
          { month: "Nov", revenue: 430000 },
          { month: "Dec", revenue: 500000 },
          { month: "Jan", revenue: 280000 }
        ];
      case "Year":
        return [
          { month: "Jan", revenue: 280000 },
          { month: "Feb", revenue: 320000 },
          { month: "Mar", revenue: 350000 },
          { month: "Apr", revenue: 380000 },
          { month: "May", revenue: 420000 },
          { month: "Jun", revenue: 450000 },
          { month: "Jul", revenue: 480000 },
          { month: "Aug", revenue: 520000 },
          { month: "Sep", revenue: 490000 },
          { month: "Oct", revenue: 460000 },
          { month: "Nov", revenue: 430000 },
          { month: "Dec", revenue: 500000 }
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
            const revenue = Math.floor(Math.random() * 50000) + 20000; // Random revenue between 20K-70K
            customData.push({ date: dateStr, revenue });
          }
          return customData;
        }
        return [
          { time: "00:00", revenue: 2000 },
          { time: "04:00", revenue: 3500 },
          { time: "08:00", revenue: 2800 },
          { time: "12:00", revenue: 6500 },
          { time: "16:00", revenue: 8200 },
          { time: "20:00", revenue: 12000 },
          { time: "24:00", revenue: 8000 }
        ];
      default:
        return [
          { time: "00:00", revenue: 2000 },
          { time: "04:00", revenue: 3500 },
          { time: "08:00", revenue: 2800 },
          { time: "12:00", revenue: 6500 },
          { time: "16:00", revenue: 8200 },
          { time: "20:00", revenue: 12000 },
          { time: "24:00", revenue: 8000 }
        ];
    }
  };

  const chartData = getChartData(timePeriod);
  const xAxisKey = timePeriod === "Today" ? "time" : timePeriod === "Week" ? "day" : timePeriod === "Month" ? "week" : timePeriod === "Business Season" ? "month" : timePeriod === "Custom date" ? "date" : "month";

  const series = [
    {
      name: "Revenue",
      data: chartData.map(item => item.revenue)
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
          Revenue trend {timePeriod === "Custom date" && customDateRange?.startDate && customDateRange?.endDate 
            ? `${customDateRange.startDate} to ${customDateRange.endDate}`
            : timePeriod}
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

export default RevenueChart;
