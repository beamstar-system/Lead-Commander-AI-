
import { Lead } from "../types";

export const exportLeadsToCSV = (leads: Lead[]) => {
  if (leads.length === 0) return;

  const headers = [
    "Business Name",
    "Address",
    "Phone Number",
    "Website",
    "Latitude",
    "Longitude",
    "Business Type",
    "Google Maps URL",
    "Roof Type",
    "Estimated Sq Ft",
    "Roof Condition",
    "Estimated Age",
    "Notes",
    "Scanned At"
  ];

  const rows = leads.map(lead => [
    `"${lead.businessName.replace(/"/g, '""')}"`,
    `"${lead.address.replace(/"/g, '""')}"`,
    `"${lead.phoneNumber}"`,
    `"${lead.website}"`,
    lead.latitude,
    lead.longitude,
    `"${lead.businessType}"`,
    `"${lead.googleMapsUrl}"`,
    `"${lead.roofType}"`,
    `"${lead.estimatedSqFt}"`,
    `"${lead.roofCondition}"`,
    `"${lead.estimatedAge}"`,
    `"${lead.notes.replace(/"/g, '""')}"`,
    `"${lead.scannedAt}"`
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `roofmaxx_leads_pittsburgh_${timestamp}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
