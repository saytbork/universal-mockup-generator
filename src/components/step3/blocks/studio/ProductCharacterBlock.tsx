import React from 'react';
import { AccordionSection } from '../../../ui/AccordionSection';

type Props = {
  icon: React.ElementType;
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

const ProductCharacterBlock: React.FC<Props> = ({
  icon,
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
      title="Product Character"
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

export default ProductCharacterBlock;
