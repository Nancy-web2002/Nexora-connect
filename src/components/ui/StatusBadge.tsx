import React from 'react';
import { VerificationStatus, EvidenceCheckStatus } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDescription = false,
}) => {
  const config = {
    Verified: {
      label: 'Verified Credible',
      icon: ShieldCheck,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconClass: 'text-emerald-600',
      description: 'Confirmed official provider, active intake corroborated, zero application fee verified.',
    },
    'Partially Verified': {
      label: 'Partially Verified',
      icon: ShieldAlert,
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
      iconClass: 'text-amber-600',
      description: 'Provider confirmed, but cohort dates or co-funding allocations require independent verification.',
    },
    Unverified: {
      label: 'Unverified / Caution',
      icon: ShieldX,
      badgeClass: 'bg-rose-50 text-rose-900 border-rose-200',
      iconClass: 'text-rose-600',
      description: 'Potential fee extortion, missing corporate accreditation, or recent domain creation flag.',
    },
  }[status];

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  return (
    <div className="inline-flex flex-col">
      <div
        className={`inline-flex items-center rounded-md border ${config.badgeClass} ${sizeClasses} select-none font-medium`}
      >
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>{config.label}</span>
      </div>
      {showDescription && (
        <span className="text-xs text-slate-500 mt-1">{config.description}</span>
      )}
    </div>
  );
};

interface EvidenceBadgeProps {
  status: EvidenceCheckStatus;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ status }) => {
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Confirmed</span>
      </span>
    );
  }

  if (status === 'caution') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Partial / Caution</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
      <XCircle className="w-3.5 h-3.5 text-rose-600" />
      <span>Missing / Flagged</span>
    </span>
  );
};
