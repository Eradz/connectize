import React from 'react';

// Minimal fallback component to satisfy default import.
// Replace with full implementation as needed.
export default function SubscriptionPlanDetail({ plan, features = [], className = '' }) {
	if (!plan) {
		return (
			<div className={`p-4 border rounded-lg bg-white ${className}`}>
				<h3 className="text-lg font-semibold">Subscription Plan</h3>
				<p className="text-sm text-gray-600">No plan data provided.</p>
			</div>
		);
	}

	return (
		<div className={`p-6 border rounded-xl bg-white shadow-sm ${className}`}>
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-xl font-bold">{plan.name || plan.plan_type || 'Plan'}</h3>
				{plan.price && (
					<div className="text-lg font-semibold">
						${plan.price}
						{plan.billing_cycle && (
							<span className="text-sm text-gray-500">/{plan.billing_cycle}</span>
						)}
					</div>
				)}
			</div>
			{plan.description && (
				<p className="text-gray-600 mb-4">{plan.description}</p>
			)}
			{features.length > 0 && (
				<ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
					{features.slice(0, 8).map((f, idx) => (
						<li key={idx}>{f.feature_name || f.name || String(f)}</li>
					))}
					{features.length > 8 && (
						<li className="text-gray-500">+{features.length - 8} more</li>
					)}
				</ul>
			)}
		</div>
	);
}

