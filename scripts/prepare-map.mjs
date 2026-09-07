import { readFileSync, writeFileSync } from 'node:fs';
const data = JSON.parse(readFileSync('public/maps/singapore.geojson', 'utf8'));
const polygons = data.features.flatMap((f) => f.geometry.coordinates);
const coords = polygons.flat(2);
const minX = Math.min(...coords.map((p) => p[0])),
  maxX = Math.max(...coords.map((p) => p[0]));
const minY = Math.min(...coords.map((p) => p[1])),
  maxY = Math.max(...coords.map((p) => p[1]));
const scale = Math.min(840 / (maxX - minX), 460 / (maxY - minY));
const project = ([x, y]) => [
  500 + (x - (maxX + minX) / 2) * scale,
  310 - (y - (maxY + minY) / 2) * scale,
];
const paths = polygons.map((p) =>
  p
    .map(
      (r) =>
        r
          .map(
            (c, i) =>
              (i ? 'L' : 'M') +
              project(c)
                .map((n) => n.toFixed(2))
                .join(','),
          )
          .join(' ') + ' Z',
    )
    .join(' '),
);
writeFileSync(
  'content/singapore-map.json',
  JSON.stringify({
    paths,
    kampongGlam: project([103.859, 1.302]),
    chinatown: project([103.8436, 1.2838]),
  }),
);
console.log('Prepared Singapore outline:', paths.length, 'island polygons.');
