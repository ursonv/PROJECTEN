import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="c-modal" onClick={onClose}>
      <div className="c-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="c-modal__content--close-button" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
