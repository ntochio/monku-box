export function normalizeTopicLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}
