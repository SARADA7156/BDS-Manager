import { Line } from 'react-chartjs-2';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    Title,
    Tooltip,
    type ChartData,
    type ChartOptions,
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface LineChartProps {
    data: ChartData<'line', number[], string>;
    options: ChartOptions<'line'>;
}

const LineChart = ({ data, options }: LineChartProps) => {
    return (
        <div>
            <Line data={data} options={options} />
        </div>
    )
}

export default LineChart;