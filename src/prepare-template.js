// Raw HTML templates bypass Vite's normal URL rewriting.
export function prepareTemplate(template, baseUrl) {
  return template.replaceAll("url('ambient.webp')", `url('${baseUrl}ambient.webp')`);
}
