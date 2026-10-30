import type { Question } from '../engine/questions';

// The part of a game where the player gives an answer (bubbles, number pad, ...).
export interface AnswerPad {
  el: HTMLElement;
  wrong(value: number): void;
  right(value: number): void;
  reveal(answer: number): void;
  destroy?(): void;
}

// `slot` is the "?" box in the question; `submit` is called with the player's answer.
export type PadFactory = (q: Question, slot: HTMLElement, submit: (value: number) => void) => AnswerPad;

export function shake(el: HTMLElement): void {
  el.classList.remove('shake');
  void el.offsetWidth; // restart the animation
  el.classList.add('shake');
}
