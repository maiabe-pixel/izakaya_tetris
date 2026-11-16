import { ALL_MINOS } from './minos';
import type { MinoType } from '../types';

export function shuffleInPlace<T>(arr: T[], rand: () => number = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createSevenBag(rand: () => number = Math.random): MinoType[] {
  return shuffleInPlace([...ALL_MINOS], rand);
}

export class SevenBag {
  private bag: MinoType[] = [];
  constructor(private rand: () => number = Math.random) {}

  next(): MinoType {
    if (this.bag.length === 0) {
      this.bag = createSevenBag(this.rand);
    }
    return this.bag.pop()!;
  }

  peekNext(): MinoType | null {
    if (this.bag.length === 0) {
      this.bag = createSevenBag(this.rand);
    }
    return this.bag[this.bag.length - 1] ?? null;
  }

  /** Snapshot remaining bag (for tests). */
  remaining(): MinoType[] {
    return this.bag.slice();
  }
}
