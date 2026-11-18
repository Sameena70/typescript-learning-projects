import { Expense } from './types.js';

export interface MonthPoint {
  dayLabel: string;
  income: number;
  expense: number;
}

export function computeDailyTrend(expenses: Expense[], year: number, month: number): MonthPoint[] {
  const days = ['Jan 1', 'Jan 7', 'Jan 14', 'Jan 21', 'Jan 31'];
  const buckets: MonthPoint[] = [
    { dayLabel: days[0], income: 0, expense: 0 },
    { dayLabel: days[1], income: 0, expense: 0 },
    { dayLabel: days[2], income: 0, expense: 0 },
    { dayLabel: days[3], income: 0, expense: 0 },
    { dayLabel: days[4], income: 0, expense: 0 }
  ];

  expenses.forEach((e) => {
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return;
    if (year !== -1 && d.getFullYear() !== year) return;
    if (month !== -1 && d.getMonth() !== month) return;

    const day = d.getDate();
    let idx: number;
    if (day <= 7) idx = 1;
    else if (day <= 14) idx = 2;
    else if (day <= 21) idx = 3;
    else idx = 4;

    if (e.type === 'income') {
      buckets[idx].income += e.amount;
    } else {
      buckets[idx].expense += e.amount;
    }
  });

  return buckets;
}

export function renderMonthlyLineChartSVG(
  svgEl: SVGSVGElement,
  points: MonthPoint[],
  currentBalanceFormatted: string
): void {
  const width = 480;
  const height = 180;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 28;

  let maxVal = 75000;
  points.forEach((p) => {
    if (p.income > maxVal) maxVal = p.income;
    if (p.expense > maxVal) maxVal = p.expense;
  });
  maxVal = Math.ceil(maxVal / 25000) * 25000;
  if (maxVal <= 0) maxVal = 75000;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (idx: number): number => paddingLeft + (idx / (points.length - 1)) * chartW;
  const getY = (val: number): number => paddingTop + chartH - (val / maxVal) * chartH;

  const incPoints = points.map((p, i) => `${getX(i)},${getY(p.income)}`).join(' ');
  const expPoints = points.map((p, i) => `${getX(i)},${getY(p.expense)}`).join(' ');

  const gridSteps = [0, 0.333, 0.666, 1];
  let gridLines = '';
  gridSteps.forEach((step) => {
    const y = paddingTop + chartH * (1 - step);
    const label = step === 0 ? '0k' : `${Math.round((maxVal * step) / 1000)}k`;
    gridLines += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="rgba(226, 232, 240, 0.8)" stroke-dasharray="3,3" />
      <text x="${paddingLeft - 8}" y="${y + 4}" fill="#94a3b8" font-size="10" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="end">${label}</text>
    `;
  });

  let xLabels = '';
  points.forEach((p, i) => {
    const x = getX(i);
    xLabels += `<text x="${x}" y="${height - 8}" fill="#94a3b8" font-size="10" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${p.dayLabel}</text>`;
  });

  let incDots = '';
  points.forEach((p, i) => {
    incDots += `<circle cx="${getX(i)}" cy="${getY(p.income)}" r="4" fill="#3b82f6" stroke="#ffffff" stroke-width="2" />`;
  });

  let expDots = '';
  points.forEach((p, i) => {
    expDots += `<circle cx="${getX(i)}" cy="${getY(p.expense)}" r="4" fill="#a855f7" stroke="#ffffff" stroke-width="2" />`;
  });

  const lastExpX = getX(points.length - 1);
  const lastExpY = getY(points[points.length - 1].expense);
  const tooltipX = lastExpX - 45;
  const tooltipY = Math.max(10, lastExpY - 32);

  const tooltip = `
    <g class="chart-tooltip-group">
      <rect x="${tooltipX}" y="${tooltipY}" width="54" height="22" rx="6" fill="#0f172a" />
      <text x="${tooltipX + 27}" y="${tooltipY + 15}" fill="#ffffff" font-size="10" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${currentBalanceFormatted}</text>
      <polygon points="${lastExpX},${lastExpY - 3} ${lastExpX - 4},${tooltipY + 22} ${lastExpX + 4},${tooltipY + 22}" fill="#0f172a" />
    </g>
  `;

  svgEl.innerHTML = `
    <defs>
      <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
      </linearGradient>
      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#a855f7" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    ${gridLines}
    <polygon points="${paddingLeft},${paddingTop + chartH} ${incPoints} ${width - paddingRight},${paddingTop + chartH}" fill="url(#incGrad)" />
    <polyline fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${incPoints}" />
    <polygon points="${paddingLeft},${paddingTop + chartH} ${expPoints} ${width - paddingRight},${paddingTop + chartH}" fill="url(#expGrad)" />
    <polyline fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${expPoints}" />
    ${incDots}
    ${expDots}
    ${xLabels}
    ${tooltip}
  `;
}

export interface CategorySegment {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#3b82f6',
  Transportation: '#a855f7',
  Shopping: '#64748b',
  Entertainment: '#f97316',
  'Bills & Utilities': '#eab308',
  Other: '#f59e0b'
};

export function renderDonutChart(
  canvasEl: HTMLCanvasElement,
  legendEl: HTMLElement,
  categories: Record<string, number>,
  totalExpense: number
): void {
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return;

  const width = canvasEl.width;
  const height = canvasEl.height;
  ctx.clearRect(0, 0, width, height);

  const fallbackCategories = [
    { name: 'Food', color: '#3b82f6', pct: 35 },
    { name: 'Transport', color: '#a855f7', pct: 28 },
    { name: 'Shopping', color: '#64748b', pct: 20 },
    { name: 'Others', color: '#f59e0b', pct: 17 }
  ];

  let segments: { name: string; color: string; pct: number }[] = [];

  const validEntries = Object.entries(categories).filter(([, val]) => val > 0);
  if (validEntries.length === 0 || totalExpense <= 0) {
    segments = fallbackCategories;
  } else {
    validEntries.sort((a, b) => b[1] - a[1]);
    const top4 = validEntries.slice(0, 3);
    const rest = validEntries.slice(3);

    top4.forEach(([cat, amt]) => {
      const pct = Math.round((amt / totalExpense) * 100);
      let shortName = cat.replace(' & Dining', '').replace('ation', '');
      if (shortName.length > 10) shortName = shortName.substring(0, 9);
      segments.push({
        name: shortName,
        color: CATEGORY_COLORS[cat] || '#3b82f6',
        pct
      });
    });

    if (rest.length > 0) {
      const restTotal = rest.reduce((sum, [, amt]) => sum + amt, 0);
      segments.push({
        name: 'Others',
        color: '#f59e0b',
        pct: Math.round((restTotal / totalExpense) * 100)
      });
    }
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 8;
  const innerRadius = radius * 0.58;

  let startAngle = -Math.PI / 2;

  segments.forEach((seg) => {
    const sliceAngle = (seg.pct / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    startAngle += sliceAngle;
  });

  legendEl.innerHTML = '';
  segments.forEach((seg) => {
    const item = document.createElement('div');
    item.className = 'top-cat-item';
    item.innerHTML = `
      <div class="top-cat-left">
        <span class="top-cat-dot" style="background-color: ${seg.color}"></span>
        <span class="top-cat-name">${seg.name}</span>
      </div>
      <span class="top-cat-pct">${seg.pct}%</span>
    `;
    legendEl.appendChild(item);
  });
}

/**
 * Renders an income vs expense bar comparison chart (SVG).
 */
export function renderComparisonBarChartSVG(
  svgEl: SVGSVGElement,
  income: number,
  expense: number,
  currencySymbol: string = '₹'
): void {
  const maxVal = Math.max(income, expense, 1000) * 1.15;

  const barWidth = 70;
  const incomeHeight = (income / maxVal) * 120;
  const expenseHeight = (expense / maxVal) * 120;

  const incomeX = 130;
  const expenseX = 280;
  const baseY = 145;

  const incY = baseY - incomeHeight;
  const expY = baseY - expenseHeight;

  svgEl.innerHTML = `
    <line x1="40" y1="${baseY}" x2="440" y2="${baseY}" stroke="rgba(226, 232, 240, 0.9)" stroke-width="1.5" />
    <text x="40" y="${baseY - 120}" fill="#94a3b8" font-size="10" font-family="'Plus Jakarta Sans', sans-serif">Max: ${currencySymbol}${Math.round(maxVal).toLocaleString()}</text>
    
    <!-- Income Bar -->
    <rect x="${incomeX}" y="${incY}" width="${barWidth}" height="${incomeHeight}" rx="8" fill="#3b82f6" />
    <text x="${incomeX + barWidth / 2}" y="${Math.max(15, incY - 8)}" fill="#3b82f6" font-size="11" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${currencySymbol}${Math.round(income).toLocaleString()}</text>
    <text x="${incomeX + barWidth / 2}" y="${baseY + 18}" fill="#64748b" font-size="11" font-weight="600" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">Income</text>
    
    <!-- Expense Bar -->
    <rect x="${expenseX}" y="${expY}" width="${barWidth}" height="${expenseHeight}" rx="8" fill="#f43f5e" />
    <text x="${expenseX + barWidth / 2}" y="${Math.max(15, expY - 8)}" fill="#f43f5e" font-size="11" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${currencySymbol}${Math.round(expense).toLocaleString()}</text>
    <text x="${expenseX + barWidth / 2}" y="${baseY + 18}" fill="#64748b" font-size="11" font-weight="600" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">Expenses</text>
  `;
}

/**
 * Renders a monthly trends multi-bar / trend SVG chart for Analytics page.
 */
export function renderAnalyticsMonthlyTrendsSVG(
  svgEl: SVGSVGElement,
  trends: { period: string; income: number; expenses: number }[]
): void {
  const width = 480;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  if (trends.length === 0) {
    svgEl.innerHTML = `<text x="240" y="90" fill="#94a3b8" font-size="12" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">No historical data available</text>`;
    return;
  }

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  let maxVal = 1000;
  trends.forEach((t) => {
    if (t.income > maxVal) maxVal = t.income;
    if (t.expenses > maxVal) maxVal = t.expenses;
  });
  maxVal = Math.ceil(maxVal * 1.15);

  const slotW = chartW / trends.length;
  const barW = Math.min(22, slotW * 0.32);

  let elements = '';
  // Horizontal grid lines
  [0, 0.5, 1].forEach((fraction) => {
    const y = paddingTop + chartH * (1 - fraction);
    elements += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="rgba(226, 232, 240, 0.8)" stroke-dasharray="3,3" />
      <text x="${paddingLeft - 6}" y="${y + 4}" fill="#94a3b8" font-size="9" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="end">${fraction === 0 ? '0' : Math.round((maxVal * fraction) / 1000) + 'k'}</text>
    `;
  });

  trends.forEach((t, i) => {
    const centerX = paddingLeft + i * slotW + slotW / 2;
    const incH = (t.income / maxVal) * chartH;
    const expH = (t.expenses / maxVal) * chartH;

    const incX = centerX - barW - 2;
    const expX = centerX + 2;

    const incY = paddingTop + chartH - incH;
    const expY = paddingTop + chartH - expH;

    elements += `
      <!-- Income bar -->
      <rect x="${incX}" y="${incY}" width="${barW}" height="${incH}" rx="4" fill="#3b82f6" />
      <!-- Expense bar -->
      <rect x="${expX}" y="${expY}" width="${barW}" height="${expH}" rx="4" fill="#a855f7" />
      <!-- Month label -->
      <text x="${centerX}" y="${height - 10}" fill="#64748b" font-size="10" font-weight="600" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${t.period.slice(5)}</text>
    `;
  });

  svgEl.innerHTML = elements;
}
