const CHART = {
  grid: '#2a2f2a',
  axis: '#8a9387',
  tooltip: { bg: '#1e2020', border: '#41493f' },
  colors: ['#93d695', '#8bd88e', '#ffb954', '#7ec8e3', '#c4a1ff', '#ffb4ab'],
};

export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: CHART.tooltip.bg,
    border: `1px solid ${CHART.tooltip.border}`,
    borderRadius: '12px',
    fontSize: '12px',
  },
  labelStyle: { color: '#c0c9bc' },
  itemStyle: { color: '#e2e2e2' },
};

export const chartAxisProps = {
  stroke: CHART.axis,
  tick: { fill: CHART.axis, fontSize: 11 },
  tickLine: false,
  axisLine: false,
};

export const chartGridProps = {
  stroke: CHART.grid,
  strokeDasharray: '3 3',
  vertical: false,
};

export { CHART };
