export const ORDER_STATES = {
  UNPROCESSED: "UnprocessedOrder",
  STOCK_CHECKING: "StockChecking",
  PART_CHECKING: "PartChecking",
  PENDING_PARTS: "PendingParts",
  IN_PRODUCTION: "InProduction",
  PRODUCTION_COMPLETED: "ProductionCompleted",
  PENDING_BILLING: "PendingBilling",
  FULFILLED: "FulfilledOrder",
};

export const ORDER_ACTIONS = {
  PROCESS: "processOrder",
  STOCK_AVAILABLE: "stock_available",
  STOCK_UNAVAILABLE: "stock_unavailable",
  PARTS_AVAILABLE: "parts_available",
  PARTS_UNAVAILABLE: "parts_unavailable",
  PARTS_DELIVERED: "parts_delivered",
  PRODUCTION_DONE: "production_done",
  GENERATE_BILL: "generate_bill",
  PAYMENT_OK: "payment_ok",
};

export const getNextOrderState = (currentState, action) => {
  switch (currentState) {
    case ORDER_STATES.UNPROCESSED:
      if (action === ORDER_ACTIONS.PROCESS) return ORDER_STATES.STOCK_CHECKING;
      break;
    case ORDER_STATES.STOCK_CHECKING:
      if (action === ORDER_ACTIONS.STOCK_AVAILABLE)
        return ORDER_STATES.PENDING_BILLING;
      if (action === ORDER_ACTIONS.STOCK_UNAVAILABLE)
        return ORDER_STATES.PART_CHECKING;
      break;
    case ORDER_STATES.PART_CHECKING:
      if (action === ORDER_ACTIONS.PARTS_AVAILABLE)
        return ORDER_STATES.IN_PRODUCTION;
      if (action === ORDER_ACTIONS.PARTS_UNAVAILABLE)
        return ORDER_STATES.PENDING_PARTS;
      break;
    case ORDER_STATES.PENDING_PARTS:
      if (action === ORDER_ACTIONS.PARTS_DELIVERED)
        return ORDER_STATES.IN_PRODUCTION;
      break;
    case ORDER_STATES.IN_PRODUCTION:
      if (action === ORDER_ACTIONS.PRODUCTION_DONE)
        return ORDER_STATES.PRODUCTION_COMPLETED;
      break;
    case ORDER_STATES.PRODUCTION_COMPLETED:
      if (action === ORDER_ACTIONS.GENERATE_BILL)
        return ORDER_STATES.PENDING_BILLING;
      break;
    case ORDER_STATES.PENDING_BILLING:
      if (action === ORDER_ACTIONS.PAYMENT_OK) return ORDER_STATES.FULFILLED;
      break;
    case ORDER_STATES.FULFILLED:
      return currentState; // Terminal state
    default:
      console.error(`Unknown state: ${currentState}`);
      return currentState;
  }
  return currentState; // Fallback to current state if action is invalid for the state
};
