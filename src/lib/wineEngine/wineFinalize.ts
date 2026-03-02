export function finalizeWinePrompt(segments: string[]): string {
  // No reorder, no normalization, no sanitization shared
  return segments.join(' ');
}
