// Story: Mara Voss, fixer of the harbor, and Dante Reyes, a taxi driver
// in debt — the two voices that carry the six missions.
export const STORY_CHARACTER_COUNT = 4;

export const CHARACTERS = [
  { name: 'Mara Voss', role: 'Harbor fixer', color: '#ff9a5c', line: 'The Keys run on favors. You just became my favorite.' },
  { name: 'Dante Reyes', role: 'Taxi driver in debt', color: '#ffc21c', line: 'One more run and I am clean. You drive, I talk.' },
  { name: 'Rook', role: 'East Keys gang lieutenant', color: '#d84a4a', line: 'This corner is ours, stranger.' },
  { name: 'Officer Hale', role: 'Keys PD patrol sergeant', color: '#2f7bff', line: 'Sunset Keys PD. Step out of the vehicle.' },
];

export function characterByName(name) { return CHARACTERS.find((c) => c.name === name); }
export function introLine() {
  return 'Mara Voss: "New in town? The Keys pay in cash and remember in grudges."';
}
export function outroLine() {
  return 'Mara Voss: "Six runs, no witnesses that matter. Sunset Keys is yours."';
}
