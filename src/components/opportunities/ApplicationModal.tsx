
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  opportunityTitle: string;
  loading?: boolean;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  opportunityTitle,
  loading = false 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(message);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
      <div className="glass-card max-w-lg w-full slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Apply to Opportunity</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2">{opportunityTitle}</h3>
            <p className="text-sm text-muted-foreground">
              Tell the brand why you're the perfect fit for this campaign.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">
              Application Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your relevant experience, audience demographics, and why you're interested in this opportunity..."
              className="premium-input w-full resize-none min-h-[120px] transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/20 text-muted-foreground rounded-xl hover:bg-white/5 transition-all duration-200 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !message.trim()}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;
