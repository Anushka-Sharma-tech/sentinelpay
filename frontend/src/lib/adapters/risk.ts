import { demoInvestigations, demoRiskEvents } from "@/data/demo/risk";

export async function getRiskEvents() {
  return demoRiskEvents;
}

export async function getRiskEvent(id: string) {
  return demoRiskEvents.find((event) => event.id === id) ?? null;
}

export async function getInvestigations() {
  return demoInvestigations;
}

export async function getInvestigation(id: string) {
  return demoInvestigations.find((item) => item.id === id) ?? null;
}
