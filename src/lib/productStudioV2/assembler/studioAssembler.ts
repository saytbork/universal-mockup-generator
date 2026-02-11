export function assembleStudioPrompt(blocks: string[]): string {
  return blocks.filter((block) => block.trim().length > 0).join('\n\n');
}
