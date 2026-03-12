import React from 'react';
import { AccordionSection } from '../../../ui/AccordionSection';

type Props = {
  icon: React.ElementType;
  title?: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  isTouched?: boolean;
  required?: boolean;
  variant?: 'primary' | 'secondary' | 'expert';
  id?: string;
  isActive?: boolean;
  className?: string;
  children: React.ReactNode;
};

const CommerceLayerBlock: React.FC<Props> = ({
  icon,
  title = 'Commerce Layer',
  description,
  isOpen,
  onToggle,
  isTouched,
  required,
  variant = 'primary',
  id,
  isActive,
  className,
  children,
}) => {
  return (
    <AccordionSection
      icon={icon}
      title={title}
      description={description}
      isOpen={isOpen}
      onToggle={onToggle}
      isTouched={isTouched}
      required={required}
      variant={variant}
      id={id}
      isActive={isActive}
      className={className}
    >
      {children}
    </AccordionSection>
  );
};

export default CommerceLayerBlock;
