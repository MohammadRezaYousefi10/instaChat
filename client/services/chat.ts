import { api } from "@/context/AppContext";


interface SendMessageParams {
  receiverId: string;
  text?: string;
  mediaUri?: string | null;
  mediaMime?: string;
  mediaName?: string;
}

export async function sendMessage({
  receiverId,
  text,
  mediaUri,
  mediaMime,
  mediaName,
}: SendMessageParams) {

  const formData = new FormData();

  formData.append("receiverId", receiverId);

  if (text?.trim()) {
    formData.append("text", text.trim());
  }

  if (mediaUri) {
    formData.append("file", {
      uri: mediaUri,
      type: mediaMime,
      name: mediaName,
    } as any);
  }
 
  const { data } = await api.post(
    "/api/messages/send",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}