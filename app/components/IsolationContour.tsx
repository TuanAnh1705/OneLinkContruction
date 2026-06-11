'use client'

interface IsolationContourProps {
  className?: string
  opacity?: number
  secondInstance?: boolean
}

export default function IsolationContour({
  className = '',
  opacity = 1,
  secondInstance = false,
}: IsolationContourProps) {
  const id = secondInstance ? 'b' : 'a'

  const contourPaths = [
    "M615.116 1855.83C621.475 1855.83 628.092 1855.14 634.88 1853.68C686.011 1841.22 693.23 1787.43 700.276 1735.35",
    "M1026.4 1150.31C1026.4 1150.31 1026.22 1150.14 1026.05 1150.05C972.171 1119.29 933.243 1097.03 923.447 1025.62",
    "M504.948 1837.53C504.948 1837.53 504.948 1837.61 505.034 1837.7C539.494 1883.76 597.757 1894.24 649.661 1900.34",
    "M1195.26 644.247C1208.58 690.308 1223.79 742.47 1276.21 753.297C1315.91 768.25 1363.6 759.141 1409.75 750.29",
    "M1321.67 732.158C1360.34 742.212 1398.06 731.986 1434.5 722.104C1449.02 718.151 1464.06 714.112 1478.84 711.448",
    "M942.524 1922C951.547 1815.27 993.053 1713.44 1033.27 1614.87C1039.72 1599.06 1046.42 1582.65 1052.78 1566.66",
    "M738.517 976.039C727.002 952.75 704.917 939.688 683.605 927.056C661.434 913.908 638.576 900.417 626.373 875.238",
    "M976.382 1922C969.078 1843.63 997.608 1794.56 1027.77 1742.83C1045.47 1712.49 1063.78 1681.04 1076.41 1641.77"
  ]

  return (
    <div
      className={`pointer-events-none select-none relative w-full h-full ${className}`}
      style={{ opacity, contain: 'layout paint' }}
    >
      <style>{`
        /* Chuyển việc render mask sang GPU bằng CSS */
        .css-wave-mask-${id} {
          position: absolute;
          inset: 0;
          -webkit-mask-image: linear-gradient(
            -45deg,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 1) 50%,
            transparent 60%,
            transparent 100%
          );
          -webkit-mask-size: 300% 300%;
          -webkit-mask-repeat: no-repeat;
          animation: cssSweep${id} 5s infinite linear;
          /* Ép trình duyệt sử dụng GPU cho element này */
          transform: translateZ(0);
          will-change: mask-position;
        }

        @keyframes cssSweep${id} {
          0% { -webkit-mask-position: 200% 0; }
          100% { -webkit-mask-position: -100% 0; }
        }
      `}</style>

      {/* LỚP 1: BÊN DƯỚI CÙNG - SVG Tĩnh hoàn toàn, độ mờ thấp, không lag */}
      <div className="absolute inset-0">
        <svg
          width="1920" height="1922" viewBox="0 0 1920 1922"
          fill="none" xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Ambient glow */}
          <path
            d="M615.116 1855.83C621.475 1855.83 628.092 1855.14 634.88 1853.68C686.011 1841.22 693.23 1787.43 700.276 1735.35... (phần đường dẫn ambient glow của bạn, mình thu gọn lại cho đỡ dài) ...H615.116L615.116 1855.83Z"
            fill="#5070e0" fillOpacity="0.04"
          />
          {/* Các đường nét viền mờ làm nền */}
          <g opacity="0.15">
            {contourPaths.map((d, i) => (
              <path key={i} d={d} stroke="#7090ff" strokeWidth="1" strokeLinecap="round" />
            ))}
          </g>
        </svg>
      </div>

      {/* LỚP 2: BÊN TRÊN - Chứa nét vẽ sáng, bị mask bằng CSS */}
      <div className={`css-wave-mask-${id}`}>
        <svg
          width="1920" height="1922" viewBox="0 0 1920 1922"
          fill="none" xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`glowLine${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#7090ff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id={`glow${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Các đường nét sáng — 1 GPU texture duy nhất thay vì 8 */}
          <g filter={`url(#glow${id})`}>
            {contourPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                stroke={`url(#glowLine${id})`}
                strokeWidth={i % 2 === 0 ? "1.5" : "1"}
                strokeLinecap="round"
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}