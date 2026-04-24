export type UiEventType =
  | "PAGE_VIEW"
  | "CARD_CLICK"
  | "CHART_DRILLDOWN"
  | "FILTER_CHANGE"
  | "TOGGLE_PANEL"
  | "ACTION_SUBMIT";

export interface UiEventDto {
  eventType: UiEventType;
  page: string;
  componentId?: string;
  actionType?: string;
  payload?: unknown;
  correlationId?: string;
  occurredAt?: string;
}

export interface ClientErrorDto {
  message: string;
  page?: string;
  stack?: string;
  componentId?: string;
  correlationId?: string;
  occurredAt?: string;
}
