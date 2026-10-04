export const obtenerFechaHoyLocal = () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
};

export const obtenerFechaISOHoyLocal = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
};

export const parseFechaLocal = (fechaTexto?: string | null) => {
  if (!fechaTexto) return null;
  const soloFecha = fechaTexto.includes("T") ? fechaTexto.split("T")[0] : fechaTexto;
  const [anio, mes, dia] = soloFecha.split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia);
};

export const formatearFechaRelativa = (fecha: Date): string => {
  const hoy = obtenerFechaHoyLocal();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  if (fecha.getTime() === hoy.getTime()) return "Hoy";
  if (fecha.getTime() === manana.getTime()) return "Mañana";
  return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}`;
};
