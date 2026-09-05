// Bright palettes for cobalt/dark backgrounds, with separate ink colors for paper.
export const FLOWERS = [
  { id: 'lotus', name: 'Lotus', color: '#ff83c1', target: 0.55, zoom: 1 },
  { id: 'rose', name: 'Rose', color: '#f75d87', target: 1.22, zoom: 0.83,
    palette: ['#ffb8ca', '#ef456f', '#71314f', '#ffe1df', '#df9b5d'],
    light: ['#a53054', '#aa2547', '#48182f', '#d16d86', '#82531d'] },
  { id: 'sunflower', name: 'Sunflower', color: '#ffcc4d', target: 1.18, zoom: 0.91,
    palette: ['#fff0ad', '#ffc137', '#a25a24', '#fff4cb', '#c48b43'],
    light: ['#a06a10', '#b07813', '#643a17', '#ce912a', '#71471f'] },
  { id: 'daisy', name: 'Daisy', color: '#f3f1dd', target: 1.18, zoom: 0.94,
    palette: ['#ffffef', '#e1eaf4', '#8095b8', '#ffffff', '#ffd465'],
    light: ['#62637c', '#7c7f94', '#373b54', '#a09aaa', '#9a7218'] },
  { id: 'tulip', name: 'Tulip', color: '#ff9a52', target: 0.9, zoom: 1,
    palette: ['#ffe3a0', '#ff8a48', '#a64b46', '#fff2cc', '#d9bd70'],
    light: ['#a64f27', '#b64b2e', '#622d30', '#d0874d', '#826325'] },
  { id: 'iris', name: 'Iris', color: '#b59bff', target: 0.8, zoom: 0.96,
    palette: ['#e5d9ff', '#a58bff', '#604591', '#f8efff', '#ffe084'],
    light: ['#65529c', '#754bb3', '#342448', '#aa88c6', '#a57822'] },
  { id: 'poppy', name: 'Poppy', color: '#ff766b', target: 1.18, zoom: 0.95,
    palette: ['#ffb5a0', '#ff645f', '#8b3551', '#ffe1c8', '#79527a'],
    light: ['#a9433a', '#b92f42', '#542536', '#d7796a', '#3d293e'] },
  { id: 'dahlia', name: 'Dahlia', color: '#ffa287', target: 1.18, zoom: 0.91,
    palette: ['#ffe5be', '#fa998f', '#a05179', '#fff0df', '#ffc997'],
    light: ['#b36c54', '#ad5368', '#623148', '#d6957c', '#9b6934'] },
  { id: 'cosmos', name: 'Cosmos', color: '#ef8cd5', target: 1.18, zoom: 0.97,
    palette: ['#ffdcf1', '#e57fcd', '#844486', '#ffeefa', '#ffd888'],
    light: ['#a3498c', '#a3348d', '#532952', '#cd80b4', '#997123'] },
  { id: 'bluebell', name: 'Bluebell', color: '#88b9ff', target: 1.05, zoom: 0.93,
    palette: ['#d6eaff', '#81acfa', '#4d679c', '#eff7ff', '#dfdfa8'],
    light: ['#466ba6', '#3764ac', '#29395f', '#799aca', '#8b7935'] },
]

export function getFlower(id) {
  return FLOWERS.find(flower => flower.id === id) || FLOWERS[0]
}
