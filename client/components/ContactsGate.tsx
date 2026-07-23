// client/components/ContactsGate.tsx
import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useStartChat } from "@/services/useStartChat";
import AddPhoneModal from "./AddPhoneModal";
import ContactsModal from "./ContactsModal";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ContactsGate({ visible, onClose }: Props) {
 
  const { auth } = useApp(); // فرض: useApp کاربر لاگین‌شده رو با فیلد phone برمی‌گردونه
  const user = auth.user;
  const { startChat } = useStartChat();
  const [needsPhone, setNeedsPhone] = useState(false);

  useEffect(() => {
    if (visible) {
      setNeedsPhone(!user?.phone);
    }
  }, [visible, user?.phone]);

  if (needsPhone) {
    return (
      <AddPhoneModal
        visible={visible}
        onClose={onClose}
        onVerified={() => setNeedsPhone(false)}
      />
    );
  }

  return (
    <ContactsModal
      visible={visible}
      onClose={onClose}
      onSelectUser={(registeredUser) => startChat(registeredUser as any)}
    />
  );
}