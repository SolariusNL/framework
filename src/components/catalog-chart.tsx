import { useMantineTheme } from "@mantine/core";
import { createChart } from "lightweight-charts";
import { FC, useEffect, useRef } from "react";

export type CatalogChartEntry = {
  time: string;
  open: number;
  high: number;
  low: number;
};
type CatalogChartProps = {
  data: CatalogChartEntry[];
};

const CatalogChart: FC<CatalogChartProps> = (props) => {
  const { data } = props;
  const { colors: mantine } = useMantineTheme();
  const colors = {
    backgroundColor: "black",
    textColor: "white",
    borderDownColor: mantine.red[8],
    borderUpColor: mantine.green[8],
    borderColor: mantine.gray[7],
    wickUpColor: "rgb(54, 116, 217)",
    upColor: "rgb(54, 116, 217)",
    wickDownColor: "rgb(225, 50, 85)",
    downColor: "rgb(225, 50, 85)",
  };

  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    const chart = createChart(chartContainerRef.current!, {
      layout: {
        background: { color: colors.backgroundColor },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#4444446b" },
        horzLines: { color: "#4444446b" },
      },
      timeScale: {
        borderColor: colors.borderColor,
      },
      width: chartContainerRef.current?.clientWidth,
      height: 300,
      localization: {
        priceFormatter: (price: number) => {
          return `${Math.round(price * 100) / 100}T$`;
        },
      },
    });

    chart.timeScale().fitContent();
    chart.timeScale().applyOptions({
      borderColor: "#71649C",
    });

    const newSeries = chart.addCandlestickSeries({
      upColor: colors.upColor,
      downColor: colors.downColor,
      borderDownColor: colors.borderDownColor,
      borderUpColor: colors.borderUpColor,
      wickDownColor: colors.wickDownColor,
      wickUpColor: colors.wickUpColor,
      borderVisible: false,
    });

    newSeries.setData(data);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [
    data,
    colors.backgroundColor,
    colors.textColor,
    colors.upColor,
    colors.downColor,
    colors.borderDownColor,
    colors.borderUpColor,
    colors.wickDownColor,
    colors.wickUpColor,
  ]);

  return (
    <div className={"rounded-md overflow-hidden"} ref={chartContainerRef} />
  );
};

export default CatalogChart;
