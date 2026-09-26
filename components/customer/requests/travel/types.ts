import type { SelectedPlace } from "../map/LocationSearchPicker";

export type MeetingType = "pickup" | "destination";

export type TransportType =
  | "taxi"
  | "private_car"
  | "public_transport"
  | "other";

export type TravelData = {
  meetingType: MeetingType;
  transportType: TransportType;
  returnRequired: boolean;

  origin: SelectedPlace | null;
  destination: SelectedPlace | null;
  returnLocation: SelectedPlace | null;

  meetingDetail: string;
};

export const initialTravelData: TravelData = {
  meetingType: "pickup",
  transportType: "taxi",
  returnRequired: false,

  origin: null,
  destination: null,
  returnLocation: null,

  meetingDetail: "",
};
