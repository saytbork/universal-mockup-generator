export type OutputProfile = 'luxury-brand' | 'ecommerce-conversion' | 'clinical' | 'default';

export function resolveAccentClasses(profile: OutputProfile = 'default') {
  if (profile === 'luxury-brand') {
    return {
      selected: 'bg-zinc-900 border-zinc-900 text-white',
      text: 'text-zinc-900',
      border: 'border-zinc-900/30',
    };
  }
  if (profile === 'ecommerce-conversion') {
    return {
      selected: 'bg-indigo-600 border-indigo-600 text-white',
      text: 'text-indigo-600',
      border: 'border-indigo-600/30',
    };
  }
  if (profile === 'clinical') {
    return {
      selected: 'bg-slate-700 border-slate-700 text-white',
      text: 'text-slate-700',
      border: 'border-slate-700/30',
    };
  }
  return {
    selected: 'bg-gray-900 border-gray-900 text-white',
    text: 'text-gray-900',
    border: 'border-gray-300',
  };
}
