import React, { Component } from "react";
import Card from "components/Card/Card";
import Chart from "react-apexcharts";
import { barChartData, barChartOptions } from "variables/charts";

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: [],
      chartOptions: {},
    };
  }

  componentDidMount() {
    this.updateChartData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.updateChartData();
    }
  }

  updateChartData = () => {
    const { data } = this.props;
    
    if (data && data.length > 0) {
      // Process API data for bar chart
      const processedData = [{
        name: "Revenue",
        data: data.map(item => item.revenue || item.value || 0)
      }];
      
      const processedOptions = {
        ...barChartOptions,
        xaxis: {
          ...barChartOptions.xaxis,
          categories: data.map(item => item.period || item.date || item.hour || '')
        }
      };

      this.setState({
        chartData: processedData,
        chartOptions: processedOptions,
      });
    } else {
      // NO FALLBACK DATA - show empty chart
      this.setState({
        chartData: [],
        chartOptions: {
          ...barChartOptions,
          xaxis: {
            ...barChartOptions.xaxis,
            categories: []
          }
        },
      });
    }
  }

  render() {
    return (
      <Card
        py="1rem"
        height={{ sm: "200px" }}
        width="100%"
        bg="linear-gradient(90deg, #FF8D28 0%, #E4572E 100%)"
        position="relative"
      >
        <Chart
          options={this.state.chartOptions}
          series={this.state.chartData}
          type="bar"
          width="100%"
          height="100%"
        />
      </Card>
    );
  }
}

export default BarChart;
