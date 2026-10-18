export interface AudioAdapter {
  /** Always speaks a character glyph, never a raw pinyin string. */
  speak(hanziChar: string): Promise<void>;
}
