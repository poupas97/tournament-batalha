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

type BackofficeModalContextValue = {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
};

const BackofficeModalContext =
  createContext<BackofficeModalContextValue | null>(null);

export function BackofficeModalProvider({
  children,
}: {
  children: ReactNode;
}) {
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
    [openModal, closeModal]
  );

  return (
    <BackofficeModalContext.Provider value={value}>
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
    </BackofficeModalContext.Provider>
  );
}

export function useBackofficeModal() {
  const context = useContext(BackofficeModalContext);

  if (!context) {
    throw new Error(
      "useBackofficeModal deve ser usado dentro de BackofficeModalProvider."
    );
  }

  return context;
}
