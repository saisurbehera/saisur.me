export { FLOWER_COLORS, getGradientColor, lerpColor } from './colors'
export { generateLotus } from './lotus'

import { generateLotus } from './lotus'

// Map of all available flower generators
export const GENERATORS = {
  lotus: generateLotus,
  // Fallback for others to lotus
  rose: generateLotus,
  sunflower: generateLotus,
  dahlia: generateLotus,
  orchid: generateLotus,
  cherry: generateLotus,
  iris: generateLotus,
  peony: generateLotus,
  tulip: generateLotus,
  lavender: generateLotus,
}

export const EXPERIENCE_FLOWERS = {
  default: 'lotus',
  lapis: 'lotus',
  walmart: 'lotus',
  columbia: 'lotus',
  inquirer: 'lotus',
  amfam: 'lotus',
  mindgram: 'lotus',
  umich: 'lotus',
  stellenbosch: 'lotus',
  aaa: 'lotus',
}
