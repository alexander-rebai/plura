import { ModalContext } from "@/providers/modal-provider";
import { useContext } from "react";

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error(
      'Custom hook "useModal" must be used within a ModalProvider!'
    );
  }

  return context;
};
