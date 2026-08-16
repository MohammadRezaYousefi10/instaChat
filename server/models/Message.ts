import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  receiver?: string;
  conversationId: mongoose.Types.ObjectId;
  text?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  read: boolean;
  createdAt: Date;
  clientId?: string;

  replyTo?: {
    _id: mongoose.Types.ObjectId;

    sender: string;

    text?: string;

    mediaType?: "image" | "video";
  };
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: String, ref: "User", required: true },
    receiver: { type: String, ref: "User" },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    text: { type: String, trim: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video"] },
    replyTo: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },

      sender: {
        type: String,
      },

      text: {
        type: String,
      },

      mediaType: {
        type: String,
        enum: ["image", "video"],
      },
    },
    read: { type: Boolean, default: false },
    clientId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true },
);

/* MessageSchema.index({
  conversationId: 1,
  createdAt: -1,
  _id: -1,
}); */

MessageSchema.index(
  {
    sender: 1,
    clientId: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);
const Message: Model<IMessage> = mongoose.model("Message", MessageSchema);

export default Message;
