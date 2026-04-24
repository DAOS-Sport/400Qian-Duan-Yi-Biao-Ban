export interface FacilityLineGroup {
  facilityKey: string;
  fullName: string;
  shortName: string;
  area: string;
  lineGroupId: string;
}

export const facilityLineGroups: readonly FacilityLineGroup[] = [
  {
    facilityKey: "xinbei_pool",
    fullName: "新北高中游泳池&運動中心",
    shortName: "新北",
    area: "新北",
    lineGroupId: "C66a4b3bb3fbc3dcf52d42626ec512484",
  },
  {
    facilityKey: "salu_counter",
    fullName: "駿斯-三蘆區櫃台",
    shortName: "三蘆",
    area: "三蘆區",
    lineGroupId: "Cc2100498c7c5627c1e86e93f7c4eb817",
  },
  {
    facilityKey: "songshan_pool",
    fullName: "松山國小室內溫水游泳池",
    shortName: "松山",
    area: "三蘆區",
    lineGroupId: "C9b3c5dfe2e005adafd2ed914714a1930",
  },
  {
    facilityKey: "sanmin_pool",
    fullName: "三民高中游泳池",
    shortName: "三民",
    area: "三蘆區",
    lineGroupId: "C2dc6991e51074dd47d5d275d568318f7",
  },
] as const;

export const findFacilityLineGroup = (facilityKeyOrGroupId: string): FacilityLineGroup | undefined =>
  facilityLineGroups.find(
    (facility) =>
      facility.facilityKey === facilityKeyOrGroupId ||
      facility.lineGroupId === facilityKeyOrGroupId,
  );
