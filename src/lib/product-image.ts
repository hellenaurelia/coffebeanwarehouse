export function inferBeanTag(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("luwak")) return "Luwak";
  if (n.includes("robusta")) return "Robusta";
  if (n.includes("liberica")) return "Liberica";
  return "Arabica";
}

export function getBeanImage(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes("luwak")) return "/beans/luwak.png";
  if (t.includes("robusta")) return "/beans/robusta.png";
  if (t.includes("liberica")) return "/beans/liberica.png";
  if (t.includes("arabica")) return "/beans/arabica.png";
  return "/beans/coffee.png";
}