"use client";

import SideModal from "@/components/SideModal";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type ModalOptions = {
  title: string;
  content: ReactNode;
  width?: CSSProperties["width"];
  footer?: ReactNode;
};

type ModalContextValue = {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export default function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalOptions | null>(null);

  const openModal = useCallback((options: ModalOptions) => {
    setModal(options);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const value = useMemo(
    () => ({
      openModal,
      closeModal,
    }),
    [openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <SideModal
        isOpen={Boolean(modal)}
        title={modal?.title ?? ""}
        width={modal?.width}
        footer={modal?.footer}
        onClose={closeModal}
      >
        {modal?.content}
      </SideModal>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal deve ser usado dentro de ModalProvider.");
  }

  return context;
}
