// Datos de ejemplo (hardcodeados) para mostrar en las interfaces.

export const TARGETS = [
  { id: 1, alias: 'Scanme oficial', host: 'scanme.nmap.org' },
  { id: 2, alias: 'Mi máquina', host: '127.0.0.1' },
  { id: 3, alias: 'Lab Docker', host: '172.17.0.2' },
];

export const PERFILES = [
  { id: 1, name: 'Rápido top 100' },
  { id: 2, name: 'Servicios web' },
  { id: 3, name: 'Completo 1-1000 con versiones' },
];

export const PUERTOS = [
  { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', product: 'OpenSSH', version: '6.6.1p1', extrainfo: 'Ubuntu Linux; protocol 2.0' },
  { port: 25, protocol: 'tcp', state: 'filtered', service: 'smtp', product: '', version: '', extrainfo: '' },
  { port: 80, protocol: 'tcp', state: 'open', service: 'http', product: 'Apache httpd', version: '2.4.7', extrainfo: '(Ubuntu)' },
  { port: 443, protocol: 'tcp', state: 'closed', service: 'https', product: '', version: '', extrainfo: '' },
  { port: 3306, protocol: 'tcp', state: 'closed', service: 'mysql', product: '', version: '', extrainfo: '' },
  { port: 9929, protocol: 'tcp', state: 'open', service: 'nping-echo', product: 'Nping echo', version: '', extrainfo: '' },
  { port: 31337, protocol: 'tcp', state: 'open', service: 'tcpwrapped', product: '', version: '', extrainfo: '' },
];

export const ESCANEOS = [
  { id: 1, name: 'Escaneo inicial scanme', host: 'scanme.nmap.org', perfil: 'Completo 1-1000 con versiones', status: 'Completado', fecha: '03/11/2026 12:00', duracion: '1 min 52 s', tags: ['demo'], notes: 'Primer escaneo de prueba.', comando: 'nmap -sT -p 1-1000 -sV -T3 -oX - scanme.nmap.org' },
  { id: 2, name: 'Web contenedor', host: '172.17.0.2', perfil: 'Servicios web', status: 'En curso', fecha: '04/11/2026 11:58', duracion: '—', tags: ['web'], notes: '', comando: 'nmap -sT -p 80,443,8080 -sV -T3 -oX - 172.17.0.2' },
  { id: 3, name: 'Localhost rápido', host: '127.0.0.1', perfil: 'Rápido top 100', status: 'Completado', fecha: '02/11/2026 10:10', duracion: '6 s', tags: ['local'], notes: '', comando: 'nmap -sT --top-ports 100 -T4 -oX - 127.0.0.1' },
  { id: 4, name: 'Lab SYN', host: '172.17.0.2', perfil: 'Rápido top 100', status: 'Fallido', fecha: '01/11/2026 14:30', duracion: '1 s', tags: ['lab'], notes: 'Requiere root.', comando: 'nmap -sS --top-ports 100 -T4 -oX - 172.17.0.2' },
  { id: 5, name: 'Router comunes', host: '192.168.1.1', perfil: 'Rápido top 100', status: 'Cancelado', fecha: '29/10/2026 16:00', duracion: '30 s', tags: [], notes: '', comando: 'nmap -sT --top-ports 100 -T4 -oX - 192.168.1.1' },
];

// Color de Bootstrap para cada estado
export const COLOR_ESTADO = {
  'Completado': 'success',
  'En curso': 'info',
  'Fallido': 'danger',
  'Cancelado': 'secondary',
  open: 'success',
  closed: 'secondary',
  filtered: 'warning',
};
