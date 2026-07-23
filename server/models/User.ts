import mongoose, { Model } from "mongoose";

export type PrivacyLevel = "everyone" | "contacts" | "nobody";

export interface IPrivacySettings {
  phoneNumber: PrivacyLevel;
  lastSeen: PrivacyLevel;
  profilePhoto: PrivacyLevel;
  bio: PrivacyLevel;
  calls: PrivacyLevel;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  handle: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: Date;
  isVisibleOnMap: boolean;
  phone: string,
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  privacy: IPrivacySettings;
  contacts: string[]; // برای پشتیبانی از "My Contacts" در آینده
  createdAt?: Date;
  updatedAt?: Date;
}

const PRIVACY_LEVELS = ["everyone", "contacts", "nobody"] as const;

const PrivacySchema = new mongoose.Schema<IPrivacySettings>(
  {
    phoneNumber: { type: String, enum: PRIVACY_LEVELS, default: "contacts" },
    lastSeen: { type: String, enum: PRIVACY_LEVELS, default: "everyone" },
    profilePhoto: { type: String, enum: PRIVACY_LEVELS, default: "everyone" },
    bio: { type: String, enum: PRIVACY_LEVELS, default: "everyone" },
    calls: { type: String, enum: PRIVACY_LEVELS, default: "everyone" },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    handle: { type: String, required: true, unique: true, lowercase: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    phone: { type: String, unique: true, sparse: true, index: true },
    isVisibleOnMap: { type: Boolean, default: false },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    privacy: { type: PrivacySchema, default: () => ({}) },
    contacts: { type: [String], default: [], ref: "User" },
  },
  { timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;