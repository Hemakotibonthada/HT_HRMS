import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Card } from './Card';
import type { ReactNode } from 'react';

interface OnboardingStep {
  title: string;
  content: ReactNode;
  target?: string; // CSS selector for highlighting elements
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const OnboardingTour = ({ steps, isOpen, onClose, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      title={`Step ${currentStep + 1} of ${steps.length}: ${step.title}`}
      size="md"
      closeOnEscape={false}
      closeOnOverlayClick={false}
    >
      <div className="space-y-6">
        <div className="text-slate-200 leading-relaxed">
          {step.content}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors duration-200 ${
                index === currentStep
                  ? 'bg-blue-500'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-200"
          >
            Skip Tour
          </Button>

          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button variant="primary" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Help documentation component
interface HelpSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

const HelpSection = ({ title, children, icon }: HelpSectionProps) => (
  <Card className="hover:bg-white/5 transition-colors duration-200">
    <div className="flex items-start space-x-3">
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="text-slate-300 space-y-2">{children}</div>
      </div>
    </div>
  </Card>
);

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter = ({ isOpen, onClose }: HelpCenterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const helpSections = [
    {
      title: 'Getting Started',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      content: (
        <div>
          <p>Welcome to HT Connect! Here's how to get started:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Complete your profile in the Employee Portal</li>
            <li>Submit your first timesheet</li>
            <li>Explore project management in the Work Portal</li>
            <li>Set up your preferences and notifications</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Timesheet Management',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      content: (
        <div>
          <p>Track your work hours efficiently:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Submit timesheets daily for accurate tracking</li>
            <li>Use 0.25 hour increments (15-minute intervals)</li>
            <li>Provide detailed descriptions for better project insights</li>
            <li>Your drafts are automatically saved as you type</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Project Collaboration',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      content: (
        <div>
          <p>Collaborate effectively with your team:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Use the Kanban board to track work items</li>
            <li>Assign tasks and set priorities</li>
            <li>Update status regularly to keep everyone informed</li>
            <li>Link timesheets to specific work items when possible</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Accessibility Features',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      content: (
        <div>
          <p>HT Connect is designed to be accessible for everyone:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Navigate using keyboard shortcuts (Tab, Enter, Escape)</li>
            <li>Screen reader support with proper ARIA labels</li>
            <li>High contrast mode support</li>
            <li>Reduced motion options for better accessibility</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Keyboard Shortcuts',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
        </svg>
      ),
      content: (
        <div>
          <p>Speed up your workflow with keyboard shortcuts:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Tab</kbd> - Navigate between elements</li>
            <li><kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Enter</kbd> - Activate buttons and links</li>
            <li><kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Escape</kbd> - Close modals and menus</li>
            <li><kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Ctrl + S</kbd> - Quick save forms</li>
          </ul>
        </div>
      ),
    },
  ];

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.props.children.some((child: any) => 
      typeof child === 'string' && child.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      title="Help Center"
      size="lg"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25 focus:border-blue-400"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Help sections */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredSections.map((section, index) => (
            <HelpSection
              key={index}
              title={section.title}
              icon={section.icon}
            >
              {section.content}
            </HelpSection>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400">No help topics found matching your search.</p>
          </div>
        )}

        {/* Contact support */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-slate-300 text-sm">
            Can't find what you're looking for?{' '}
            <button className="text-blue-400 hover:text-blue-300 underline">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};

// Hook for managing onboarding state
export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('ht-connect-onboarding-completed') === 'true';
  });

  const completeOnboarding = () => {
    localStorage.setItem('ht-connect-onboarding-completed', 'true');
    setHasSeenOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('ht-connect-onboarding-completed');
    setHasSeenOnboarding(false);
  };

  return {
    hasSeenOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
};

// Default onboarding steps for new users
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to HT Connect',
    content: (
      <div className="space-y-4">
        <p>Welcome to your new workspace! HT Connect helps you manage HR tasks, track time, and collaborate on projects all in one place.</p>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-300 font-medium">💡 Pro Tip</p>
          <p className="text-sm mt-1">Take a few minutes to complete this tour - it will save you time later!</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Navigation Made Easy',
    content: (
      <div className="space-y-4">
        <p>Use the navigation bar at the top to move between different areas:</p>
        <ul className="space-y-2">
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span><strong>Dashboard</strong> - Your home base with quick access to everything</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span><strong>Employee Portal</strong> - Manage your profile, timesheets, and benefits</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span><strong>Work Portal</strong> - Track projects and collaborate with your team</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Smart Features',
    content: (
      <div className="space-y-4">
        <p>HT Connect includes several features to make your work easier:</p>
        <div className="grid gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="font-medium text-white">Auto-save</p>
            <p className="text-sm text-slate-300">Your work is automatically saved as you type</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="font-medium text-white">Smart Validation</p>
            <p className="text-sm text-slate-300">Get helpful hints and prevent common mistakes</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="font-medium text-white">Mobile Friendly</p>
            <p className="text-sm text-slate-300">Access everything from any device</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'You\'re All Set!',
    content: (
      <div className="space-y-4">
        <p>Congratulations! You're ready to start using HT Connect.</p>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-300 font-medium">🎉 Ready to Go</p>
          <p className="text-sm mt-1">Remember, you can access help anytime by clicking the help button in the navigation.</p>
        </div>
        <p className="text-sm text-slate-400">This tour won't show again, but you can restart it from the help center.</p>
      </div>
    ),
  },
];