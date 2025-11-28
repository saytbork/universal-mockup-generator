import React from 'react';
import { Link } from 'react-router-dom';

const rows = [
  {
    tool: 'BoostUGC',
    photorealism: 'High (Gemini 2.5 Flash Image)',
    quality: 'UGC-first, consistent',
    mockups: 'Yes, eCommerce-ready',
    focus: 'Built for eCommerce',
    price: 'Free + paid plans',
  },
  {
    tool: 'Photoroom',
    photorealism: 'Medium',
    quality: 'Good backgrounds',
    mockups: 'Basic',
    focus: 'General',
    price: 'Paid',
  },
  {
    tool: 'Recraft',
    photorealism: 'Medium',
    quality: 'Illustrative focus',
    mockups: 'Limited',
    focus: 'Mixed',
    price: 'Paid',
  },
  {
    tool: 'ShotDrop',
    photorealism: 'Medium',
    quality: 'UGC focused',
    mockups: 'Some',
    focus: 'UGC',
    price: 'Paid',
  },
  {
    tool: 'Midjourney',
    photorealism: 'High (manual prompting)',
    quality: 'Varies by prompt',
    mockups: 'Not dedicated',
    focus: 'General',
    price: 'Paid',
  },
  {
    tool: 'Canva AI',
    photorealism: 'Medium',
    quality: 'General use',
    mockups: 'Basic',
    focus: 'Design general',
    price: 'Freemium',
  },
];

const Comparisons: React.FC = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">BoostUGC vs Competitors</h1>
          <p className="text-gray-300">Why brands choose BoostUGC for photorealistic UGC.</p>
        </div>

        <div className="overflow-x-auto bg-white text-gray-900 rounded-2xl shadow">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Tool</th>
                <th className="px-4 py-3 text-left">Photorealism</th>
                <th className="px-4 py-3 text-left">UGC Quality</th>
                <th className="px-4 py-3 text-left">Product Mockups</th>
                <th className="px-4 py-3 text-left">eCommerce Focus</th>
                <th className="px-4 py-3 text-left">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map(row => (
                <tr key={row.tool} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{row.tool}</td>
                  <td className="px-4 py-3">{row.photorealism}</td>
                  <td className="px-4 py-3">{row.quality}</td>
                  <td className="px-4 py-3">{row.mockups}</td>
                  <td className="px-4 py-3">{row.focus}</td>
                  <td className="px-4 py-3">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 text-gray-300">
          <h2 className="text-2xl font-semibold text-white">Why BoostUGC wins</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>More realistic thanks to Gemini 2.5 Flash Image.</li>
            <li>Built for eCommerce with mockups, UGC, and product photography defaults.</li>
            <li>Replaces manual content creation with fast, consistent AI visuals.</li>
          </ul>
        </div>

        <div>
          <Link
            to="/app"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-black/80"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Comparisons;
