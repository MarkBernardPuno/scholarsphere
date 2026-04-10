import React from 'react';

const CHART_SIZE = 220;
const STROKE_WIDTH = 34;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 3;

const outputTypeData = [
  { label: 'Local Presentation', value: 5, color: '#f1c40f' },
  { label: 'Local Publication', value: 5, color: '#1f78d1' },
  { label: 'International Presentation', value: 1, color: '#1ea394' },
  { label: 'International Publication', value: 0, color: '#9b9b9b' },
];

const campusData = [
  { label: 'TIP-QC (Quezon City)', value: 6, color: '#f1c40f' },
  { label: 'TIP-Manila', value: 2, color: '#1f78d1' },
];

const panel = {
  background: '#ffffff',
  border: '1px solid #ddd9cc',
  borderRadius: 14,
  padding: '24px',
  boxShadow: '0 10px 30px rgba(24, 22, 18, 0.05)',
};

const panelHeader = {
  marginBottom: 16,
};

const eyebrow = {
  color: '#8a7d65',
  fontFamily: 'Georgia, serif',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '1.4px',
  textTransform: 'uppercase',
};

const panelTitle = {
  marginTop: 6,
  color: '#171717',
  fontFamily: 'Georgia, serif',
  fontSize: 29,
  fontWeight: 700,
  lineHeight: 1.15,
};

const sectionHeader = {
  border: '1px solid #ddd9cc',
  borderRadius: 14,
  background: '#ffffff',
  boxShadow: '0 10px 30px rgba(24, 22, 18, 0.05)',
  padding: '20px 24px',
  marginBottom: 18,
};

const sectionTitle = {
  margin: 0,
  fontFamily: 'Georgia, serif',
  fontSize: 34,
  color: '#171717',
  lineHeight: 1.12,
  fontWeight: 700,
};

const sectionSubtitle = {
  marginTop: 8,
  fontFamily: 'Georgia, serif',
  fontSize: 14,
  color: '#726b5f',
  lineHeight: 1.45,
};

const statChipRow = {
  marginTop: 14,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
};

const statChip = {
  border: '1px solid #e4dece',
  background: '#faf8f2',
  borderRadius: 999,
  padding: '7px 12px',
  fontFamily: 'Georgia, serif',
  fontSize: 12,
  color: '#4f483d',
};

function DonutChart({ title, subtitle, data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulated = 0;

  return (
    <div style={panel}>
      <div style={panelHeader}>
        <div style={eyebrow}>{subtitle}</div>
        <h3 style={panelTitle}>{title}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 272px) 1fr', alignItems: 'center', gap: 22 }}>
        <div style={{ position: 'relative', width: CHART_SIZE, height: CHART_SIZE, justifySelf: 'center' }}>
          <svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
            <circle
              cx={CHART_SIZE / 2}
              cy={CHART_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#ece7d8"
              strokeWidth={STROKE_WIDTH}
            />
            {data.map((item) => {
              const fraction = total > 0 ? item.value / total : 0;
              const rawLength = fraction * CIRCUMFERENCE;
              const length = Math.max(rawLength - SEGMENT_GAP, 0);
              const dasharray = `${Math.max(length, 0)} ${CIRCUMFERENCE}`;
              const dashoffset = -accumulated;
              accumulated += rawLength;

              if (item.value <= 0) return null;
              return (
                <circle
                  key={item.label}
                  cx={CHART_SIZE / 2}
                  cy={CHART_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={dasharray}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${CHART_SIZE / 2} ${CHART_SIZE / 2})`}
                />
              );
            })}
          </svg>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#8a7c66', letterSpacing: '0.7px' }}>
              Total
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 42, color: '#1f1f1f', fontWeight: 700, lineHeight: 1 }}>
              {total}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {data.map((item) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={item.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '14px 1fr auto auto',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 11px',
                  borderRadius: 8,
                  background: '#faf8f2',
                  border: '1px solid #e6dfcf',
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: item.color,
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontFamily: 'Georgia, serif', color: '#2a2a2a', fontSize: 14 }}>{item.label}</span>
                <strong style={{ fontFamily: 'Georgia, serif', color: '#1f1f1f', fontSize: 16 }}>{item.value}</strong>
                <span style={{ fontFamily: 'Georgia, serif', color: '#746d60', fontSize: 12 }}>{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PieChartSection() {
  const repositoryTotal = outputTypeData.reduce((sum, item) => sum + item.value, 0);
  const evaluationTotal = campusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <section style={{ padding: '30px 34px 42px', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1260, margin: '0 auto' }}>
        <header style={sectionHeader}>
          <h2 style={sectionTitle}>Research Portfolio Distribution</h2>
          <p style={sectionSubtitle}>
            Summary of repository output mix and campus-level evaluation submissions.
          </p>
          <div style={statChipRow}>
            <span style={statChip}>Repository Total: {repositoryTotal}</span>
            <span style={statChip}>Evaluation Total: {evaluationTotal}</span>
            <span style={statChip}>Combined Records: {repositoryTotal + evaluationTotal}</span>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))', gap: 18 }}>
          <DonutChart title="Output Type Distribution" subtitle="Repository" data={outputTypeData} />
          <DonutChart title="Campus Distribution" subtitle="Evaluation" data={campusData} />
        </div>
      </div>
    </section>
  );
}
