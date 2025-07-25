'use client';

import { useState, type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/Dialog';

export interface StepsFormProps {
  trigger: string | ReactNode;
  title: string;
  description: string;
  steps: Array<Step>;
  onOpen?: () => void;
  onClose?: () => void;
};

export interface Step {
  component: (prev: () => void, next: () => void, close: () => void) => ReactNode;
  viewNextButton?: NavigationButton;
  viewPrevButton?: NavigationButton;
  viewCloseButton?: NavigationButton;
};

interface NavigationButton {
  status: 'active' | 'disable' | 'hidden';
  text?: string;
}

function isViewButton(button?: NavigationButton) {
  return Boolean(button && button.status !== 'hidden');
}

function StepsDialog({
  trigger, title, description, steps, onOpen, onClose,
}: StepsFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const resetDialogState = () => {
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep((step) => ++step);
  };

  const prevStep = () => {
    setCurrentStep((step) => --step);
  };

  const closeDialog = () => {
    handleDialogOpenChange(false);
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      onOpen && onOpen();
      resetDialogState();
    } else {
      onClose && onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className='max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]'>
          <div className='flex items-center justify-center space-x-2'>
            {/* eslint-disable react/no-missing-key */}
            {steps.map((_, index) => (
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
                key={index}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {steps[currentStep].component(nextStep, prevStep, closeDialog)}
        </div>

        <div className='flex justify-between gap-2 pt-4'>
          {isViewButton(steps[currentStep].viewPrevButton) && (
            <Button
              variant='outline'
              onClick={() => prevStep()}
              disabled={steps[currentStep].viewPrevButton?.status === 'disable'}
            >
              {steps[currentStep].viewPrevButton?.text || 'Назад'}
            </Button>
          )}
          {isViewButton(steps[currentStep].viewCloseButton) && (
            <Button
              onClick={() => setIsOpen(false)}
              disabled={steps[currentStep].viewCloseButton?.status === 'disable'}
            >
              {steps[currentStep].viewCloseButton?.text || 'Закрыть'}
            </Button>
          )}
          {isViewButton(steps[currentStep].viewNextButton) && (
            <Button
              variant='outline'
              onClick={() => nextStep()}
              disabled={steps[currentStep].viewNextButton?.status === 'disable'}
            >
              {steps[currentStep].viewNextButton?.text || 'Дальше'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StepsDialog;
