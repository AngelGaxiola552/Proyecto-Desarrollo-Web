// El backend guarda la salida de Nmap como XML (scan.result.raw).
// Esta función la convierte en una lista de puertos usando DOMParser, que ya viene en el navegador.
//
// Ejemplo de un puerto en el XML de Nmap:
// <port protocol="tcp" portid="22">
//   <state state="open"/>
//   <service name="ssh" product="OpenSSH" version="6.6.1p1" extrainfo="Ubuntu"/>
// </port>

export function leerPuertos(xml) {
  if (!xml) return [];
  const documento = new DOMParser().parseFromString(xml, 'text/xml');

  return [...documento.querySelectorAll('port')].map((nodo) => {
    const estado = nodo.querySelector('state');
    const servicio = nodo.querySelector('service');
    return {
      port: Number(nodo.getAttribute('portid')),
      protocol: nodo.getAttribute('protocol'),
      state: estado?.getAttribute('state') || '',
      service: servicio?.getAttribute('name') || '',
      product: servicio?.getAttribute('product') || '',
      version: servicio?.getAttribute('version') || '',
      extrainfo: servicio?.getAttribute('extrainfo') || '',
    };
  });
}
