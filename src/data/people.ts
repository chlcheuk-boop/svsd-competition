import type { Person } from '../types';

export const MAYA = {
  id: 'maya',
  name: 'Maya Lin-Okafor',
  short: 'Maya',
  craft: 'design student, year two',
  city: 'Philadelphia',
  bio: 'Collecting signage, slow films and anything printed in two colors.',
  memberSince: 'Feb 2025',
  initial: 'M',
  // what a match can be shown, if Maya allows it (Settings → What your matches see)
  username: '@maya.inks',
  demographic: '20 · Gen Z',
  origin: 'grew up in Harrisburg, PA',
  creative: 'graphic designer, still in school',
};

export const PEOPLE: Record<string, Person> = {
  maya: { id: 'maya', name: 'Maya Lin-Okafor', city: 'Philadelphia', craft: 'design student', color: 'peach', initial: 'M' },
  // weekly matches
  lena: { id: 'lena', name: 'Lena Hoffmann', city: 'Berlin', craft: 'graphic designer', color: 'sky', initial: 'L' },
  kenji: { id: 'kenji', name: 'Kenji Morita', city: 'Osaka', craft: 'illustrator', color: 'tangerine', initial: 'K' },
  marcus: { id: 'marcus', name: 'Marcus Bell', city: 'Chicago', craft: 'jazz drummer', color: 'lime', initial: 'M' },
  ama: { id: 'ama', name: 'Ama Owusu', city: 'Accra', craft: 'fashion photographer', color: 'pink', initial: 'A' },
  // past crossings
  ines: { id: 'ines', name: 'Inés Calderón', city: 'Mexico City', craft: 'textile designer', color: 'pink', initial: 'I' },
  theo: { id: 'theo', name: 'Theo Adeyemi', city: 'Lagos', craft: 'type designer', color: 'sky', initial: 'T' },
  saskia: { id: 'saskia', name: 'Saskia Vermeer', city: 'Rotterdam', craft: 'architect', color: 'lime', initial: 'S' },
  rafa: { id: 'rafa', name: 'Rafa Duarte', city: 'Lisbon', craft: 'ceramicist', color: 'tangerine', initial: 'R' },
  june: { id: 'june', name: 'June Park', city: 'Seoul', craft: 'motion designer', color: 'sky', initial: 'J' },
};

export const person = (id?: string) => (id ? PEOPLE[id] : undefined);
