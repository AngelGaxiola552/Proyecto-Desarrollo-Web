// Construye el array de argumentos de Nmap a partir de opciones validadas.
// Esta misma lógica debe replicarse en el cliente para el preview.
// No se acepta entrada libre: todo viene de la lista blanca de optionsSchema.

function buildArgs(host, options = {}) {
  const args = [];

  // Tipo de escaneo (defecto -sT)
  args.push(options.scanType || '-sT');

  // Puertos
  if (options.ports) {
    args.push('-p', options.ports);
  } else if (options.topPorts) {
    args.push('--top-ports', String(options.topPorts));
  }

  // Detección de versiones de servicio
  if (options.serviceVersion) args.push('-sV');

  // Detección de SO
  if (options.osDetection) args.push('-O');

  // Velocidad (2-4)
  const timing = Number(options.timing);
  if (timing >= 2 && timing <= 4) args.push(`-T${timing}`);

  // Sin ping previo
  if (options.noPing) args.push('-Pn');

  // Scripts NSE
  if (options.scripts && options.scripts !== 'none') {
    args.push(`--script=${options.scripts}`);
  }

  // Salida XML por stdout (siempre fijo)
  args.push('-oX', '-');

  // Host al final
  args.push(host);

  return args;
}

function buildPreview(host, options = {}) {
  return 'nmap ' + buildArgs(host, options).join(' ');
}

module.exports = { buildArgs, buildPreview };
