export const getPillClass = (isActive: boolean, _fullWidth = false) => {
  const base = 'rounded-full border px-2 py-1 text-xs transition';
  const active = 'border-indigo-400 bg-indigo-500/10 text-white';
  const inactive = 'border-gray-600 text-gray-300 hover:border-gray-500';
  return [base, isActive ? active : inactive].filter(Boolean).join(' ');
};
