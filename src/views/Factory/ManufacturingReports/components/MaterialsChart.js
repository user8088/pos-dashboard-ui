// Chakra imports
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import ReactApexChart from "react-apexcharts";

const MaterialsChart = () => {
  const textColor = useColorModeValue("gray.700", "white");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");

  // Sample data for most produced materials
  const materialsData = [
    { material: "Others", production: 65 },
    { material: "Misc", production: 75 },
    { material: "Construction Materials", production: 85 },
    { material: "Electrical Accessories", production: 90 },
    { material: "Sanitary Materials", production: 95 },
    { material: "Tools & Hardware", production: 80 },
    { material: "PVC & Pipes", production: 100 }
  ];

  const series = [
    {
      name: "Production Performance",
      data: materialsData.map(item => item.production)
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
      categories: materialsData.map(item => item.material),
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
          return `${value}% Production`;
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
          Most Produced Materials
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

export default MaterialsChart;
