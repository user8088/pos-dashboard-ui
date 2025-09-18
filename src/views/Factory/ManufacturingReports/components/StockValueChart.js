// Chakra imports
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import ReactApexChart from "react-apexcharts";

const StockValueChart = ({ timePeriod, customDateRange, chartData = [] }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");

  // Process API data for chart
  const getProcessedChartData = () => {
    if (!chartData || chartData.length === 0) return [];
    
    // For today period, chartData is hourly (0-23)
    if (timePeriod === "Today") {
      return chartData.map((value, index) => ({
        time: `${index.toString().padStart(2, '0')}:00`,
        stockValue: value
      }));
    }
    
    // For other periods, chartData represents daily/monthly values
    const labels = [];
    if (timePeriod === "Week") {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      labels.push(...days.slice(0, chartData.length));
    } else if (timePeriod === "Month") {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      labels.push(...weeks.slice(0, chartData.length));
    } else if (timePeriod === "Seasonal") {
      const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      labels.push(...months.slice(0, chartData.length));
    } else if (timePeriod === "Year") {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      labels.push(...months.slice(0, chartData.length));
    } else if (timePeriod === "Custom date") {
      // Generate date labels for custom range
      if (customDateRange?.startDate && customDateRange?.endDate) {
        const start = new Date(customDateRange.startDate);
        const end = new Date(customDateRange.endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        for (let i = 0; i <= daysDiff && i < chartData.length; i++) {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          labels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
      }
    }
    
    return chartData.map((value, index) => ({
      [timePeriod === "Today" ? "time" : 
        timePeriod === "Week" ? "day" : 
        timePeriod === "Month" ? "week" : 
        timePeriod === "Seasonal" ? "month" : 
        timePeriod === "Custom date" ? "date" : "month"]: labels[index] || `Point ${index + 1}`,
      stockValue: value
    }));
  };

  const processedData = getProcessedChartData();
  const xAxisKey = timePeriod === "Today" ? "time" : timePeriod === "Week" ? "day" : timePeriod === "Month" ? "week" : timePeriod === "Seasonal" ? "month" : timePeriod === "Custom date" ? "date" : "month";

  const series = [
    {
      name: "Production Trend",
      data: processedData.map(item => item.stockValue)
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
      categories: processedData.map(item => item[xAxisKey]),
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
          Production Trend
        </Text>
        <Text fontSize='sm' color='gray.500'>
          {timePeriod} - {processedData.length > 0 ? 'Live Data' : 'No Data Available'}
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
