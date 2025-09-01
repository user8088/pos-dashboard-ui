// Chakra imports
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import ReactApexChart from "react-apexcharts";

const CategoriesChart = () => {
  const textColor = useColorModeValue("gray.700", "white");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");

  // Sample data for best-selling categories
  const categoriesData = [
    { category: "Others", sales: 65 },
    { category: "Misc", sales: 75 },
    { category: "Construction Materials", sales: 85 },
    { category: "Electrical Accessories", sales: 90 },
    { category: "Sanitary Materials", sales: 95 },
    { category: "Tools & Hardware", sales: 80 },
    { category: "PVC & Pipes", sales: 100 }
  ];

  const series = [
    {
      name: "Sales Performance",
      data: categoriesData.map(item => item.sales)
    }
  ];

  const options = {
    chart: {
      type: "radar",
      toolbar: {
        show: false
      },
      dropShadow: {
        enabled: true,
        blur: 1,
        left: 1,
        top: 1,
        opacity: 0.2
      }
    },
    colors: ["#FF8D28"],
    fill: {
      opacity: 0.6
    },
    stroke: {
      width: 2,
      colors: ["#FF8D28"]
    },
    markers: {
      show: false
    },
    xaxis: {
      categories: categoriesData.map(item => item.category),
      labels: {
        style: {
          colors: textColor,
          fontSize: "12px",
          fontWeight: "500"
        }
      }
    },
    yaxis: {
      labels: {
        show: false
      },
      min: 0,
      max: 100
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: gridColor,
          strokeWidth: 1,
          fill: {
            colors: ["transparent"]
          }
        }
      }
    },
    tooltip: {
      theme: useColorModeValue("light", "dark"),
      y: {
        formatter: function (value) {
          return `${value}% Performance`;
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
          Best selling categories
        </Text>
      </CardHeader>
      <CardBody>
        <Box h='450px' w='100%'>
          <ReactApexChart
            options={options}
            series={series}
            type="radar"
            height="100%"
          />
        </Box>
      </CardBody>
    </Card>
  );
};

export default CategoriesChart;
