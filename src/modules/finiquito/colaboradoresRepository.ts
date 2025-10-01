// Repository para la obtención de colaboradores desde el backend
// Encapsula la lógica de consumo del endpoint y el mapeo de datos
import apiClient from '../../shared/apiClient';
import { AdminAccess } from '../../store/user';

// Tipado de colaborador según el backend
interface ColaboradoresResponse {
  results: Colaborador[];
}

export const TipoContrato = {
  '01' : 'Plazo Indefinido', 
  '02' : 'Plazo Fijo',
  '03' : 'Obra o Faena',
}
export const Cargos162 = [
10000002,10000003,10000191,10000457,10000688,10000461,10000447,
10000702,10000580,10000192,10000193,10000194,10000558,10000689,
10000524,10000549,10000557,10000535,10000676,10000196,10000197,
10000458,10000498,10000200,10000202,10000691,10000595,10000206,
10000205,10000685,10000518,10000207,10000208,10000701,10000700,
10000675,10000209,10000677,10000706,10000413,10000362,10000537,
10000404,10000363,10000364,10000366,10000513,10000367,10000368,
10000369,10000522,10000599,10000370,10000371
]


export interface Colaborador {
  user_id: number; // ID único del usuario NP
  empl_status: string; // Estado del empleado
  first_name: string; // Primer nombre
  last_name: string; // Apellido
  national_id: string; // RUT o identificación nacional
  correo_flesan: string; // Correo institucional
  correo_gmail: string; // Correo personal
  empresa: string; // Empresa a la que pertenece
  centro_costo: string; // Código de centro de costo
  external_cod_cargo: string; // Código externo del cargo
  fecha_ingreso_date: string; // Fecha de ingreso (timestamp en string)
  nombre_centro_costo: string; // Nombre del centro de costo
  external_cod_tipo_contrato: '01' | '02' | '03'; // Código externo tipo de contrato
  fecha_fin_contrato: string; // Fecha de fin de contrato (timestamp en string)
  fecha_termino: string; // Fecha de término (puede estar vacía)
  tipo_contrato: string; // Tipo de contrato
  nombre_cargo: string; // Nombre del cargo
}
export interface ColaboradorForm extends Colaborador {
  form: {
      fecha_desvinculacion: Date; //Fecha de desvinculacion
      tipo_solicitud: string; //Tipo de solicitud
      causalTermino: string; //Causal de termino
      descuentoAfc: number | null; //Descuento AFC
      grat:202127; //Gratificación
      otrosDescuentos: number | null; //Otros descuentos
      letraCausal: string; //Letra de causal
      mesAviso: number | null; //Mes de aviso
      indemnizacion: number | null; //Indemnización
  }
};
export interface Finiquito {
  np: string;
anios_servicio: number;
tiempo_servido: number;
saldo_en_dias: number;
dias_inhabiles: number;
total_dias: number;
base_indemnizaciones: number;
base_vacaciones: number;
ias: number;
isap: number;
its: number;
ivac: number;
total_finiquito: number;
fecha_desvinculacion: Date;
causal: string;
letra_causal: string;
fecha_inset: Date;
national_id: string;
first_name: string;
last_name: string;
descuento_afc: number | null;
}
/**
 * Realiza la simulación de finiquito usando el endpoint de Kiptor.
 * @param data Objeto colaborador con estructura esperada por el backend (incluye campo 'form')
 * @returns Respuesta de la simulación
 */
export async function simularFiniquitoKiptor(data: ColaboradorForm): Promise<any> {
  try {
    const response = await apiClient.post('/api/finiquito/simulate-kiptor-settlement/', data);
    return response.data;
  } catch (error: any) {
    // Lanzamos el error para que el componente lo maneje y muestre mensaje amigable
    throw error;
  }
}

export async function getColaboradores(centrosCostos: string[],ver_planta?: boolean): Promise<ColaboradoresResponse> {
  try {
    const params = {centros_costos: centrosCostos, ver_planta: ver_planta };
    const response = await apiClient.get<ColaboradoresResponse>('/api/warehouse/colaboradores/', { params });
    return response.data;
  } catch (error: any) {
    console.log(error); 
    // Lanzamos el error para que el componente lo maneje y muestre mensaje amigable
    throw error;
  }
}

export async function getCargos162(){
  const response = await apiClient.get('/api/warehouse/external-code-162/');
  return response.data;
}

/**
 * Consulta un colaborador específico por su correo electrónico.
 * @param correo Correo electrónico del colaborador a buscar
 * @returns Datos del colaborador encontrado
 */
export async function getColaboradorPorCorreo(correo: string): Promise<Colaborador> {
  try {
    const params = { correo };
    const response = await apiClient.get<Colaborador>('/api/warehouse/colaborador-por-correo/', { params });
    return response.data;
  } catch (error: any) {
    console.log(error);
    // Lanzamos el error para que el componente lo maneje y muestre mensaje amigable
    throw error;
  }
}
