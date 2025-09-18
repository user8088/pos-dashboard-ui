import React from "react";
import ReactApexChart from "react-apexcharts";
import { lineChartData, lineChartOptions } from "variables/charts";

class LineChart extends React.Component {
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
      // Process API data for line chart
      const processedData = [{
        name: "Revenue",
        data: data.map(item => item.revenue || item.value || 0)
      }];
      
      const processedOptions = {
        ...lineChartOptions,
        xaxis: {
          ...lineChartOptions.xaxis,
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
          ...lineChartOptions,
          xaxis: {
            ...lineChartOptions.xaxis,
            categories: []
          }
        },
      });
    }
  }

  render() {
    return (
      <ReactApexChart
        options={this.state.chartOptions}
        series={this.state.chartData}
        type="area"
        width="100%"
        height="100%"
      />
    );
  }
}

export default LineChart;
