import * as XLSX from 'xlsx';

// Interfaces para los datos de exportación
interface ColaboradorResult {
  colaborador: {
    first_name: string;
    last_name: string;
    user_id: number;
  };
  horasExtrasTrabajadas: number;
  valorHoraExtra: number;
  montoBonoPactado: number;
  result: {
    montoTotalHorasExtras: number;
    diferenciaLiquida: number;
    diferenciaBruto: number;
  };
}

interface ExcelRowData {
  'Nombre Completo': string;
  'Np': number;
  'Horas Extras': number;
  'Valor Hora Extra Bruto': number;
  'Total Horas Extras(Liquido)': number;
  'Bono Pactado (Liquido)': number;
  'Diferencia Liquida': number;
  'Diferencia Bruta': number;
}

/**
 * Exporta los resultados del cálculo de bono sábados a un archivo Excel
 * @param results - Array de resultados de colaboradores
 * @param fileName - Nombre del archivo (opcional)
 */
export const exportBonoSabadosToExcel = (
  results: ColaboradorResult[], 
  fileName?: string
): void => {
  try {
    // Validar que hay datos para exportar
    if (!results || results.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    // Transformar los datos al formato requerido para Excel
    const excelData: ExcelRowData[] = results.map(result => ({
      'Nombre Completo': `${result.colaborador.first_name} ${result.colaborador.last_name}`,
      'Np': result.colaborador.user_id,
      'Horas Extras': result.horasExtrasTrabajadas,
      'Valor Hora Extra Bruto': result.valorHoraExtra,
      'Total Horas Extras(Liquido)': result.result.montoTotalHorasExtras,
      'Bono Pactado (Liquido)': result.montoBonoPactado,
      'Diferencia Liquida': result.result.diferenciaLiquida, // Mostrar valor real
      'Diferencia Bruta': result.result.diferenciaBruto // Mostrar valor real
    }));

    // Crear el workbook y worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Configurar el ancho de las columnas
    const columnWidths = [
      { wch: 25 }, // Nombre Completo
      { wch: 10 }, // Np
      { wch: 12 }, // Horas Extras
      { wch: 20 }, // Valor Hora Extra Bruto
      { wch: 18 }, // Total Horas Extras(Liquido)
      { wch: 20 }, // Bono Pactado (Liquido)
      { wch: 18 }, // Diferencia Liquida
      { wch: 18 }  // Diferencia Bruta
    ];
    worksheet['!cols'] = columnWidths;

    // Aplicar formato a los números (moneda chilena)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      // Formatear columnas de moneda (columnas D, E, F, G, H - índices 3, 4, 5, 6, 7)
      const currencyColumns = [3, 4, 5, 6, 7]; // Valor Hora Extra, Total Horas Extras, Bono Pactado, Diferencia Liquida, Diferencia Bruta
      
      currencyColumns.forEach(col => {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].z = '"$"#,##0.00_);("$"#,##0.00)';
        }
      });

      // Formatear columna de horas extras (columna C - índice 2)
      const horasCell = XLSX.utils.encode_cell({ r: row, c: 2 });
      if (worksheet[horasCell]) {
        worksheet[horasCell].z = '0.0';
      }
    }

    // Aplicar estilo a los encabezados
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[headerCell]) {
        worksheet[headerCell].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: 'DC2626' } }, // Color rojo corporativo
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
    }

    // Agregar el worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bono Sábados');

    // Generar nombre del archivo si no se proporciona
    const defaultFileName = `bono_sabados_${new Date().toISOString().split('T')[0]}.xlsx`;
    const finalFileName = fileName || defaultFileName;

    // Escribir y descargar el archivo
    XLSX.writeFile(workbook, finalFileName);

    console.log(`Archivo Excel exportado exitosamente: ${finalFileName}`);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    throw new Error(`Error al exportar a Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Exporta los resultados con información adicional de resumen
 * @param results - Array de resultados de colaboradores
 * @param fileName - Nombre del archivo (opcional)
 */
export const exportBonoSabadosWithSummary = (
  results: ColaboradorResult[], 
  fileName?: string
): void => {
  try {
    if (!results || results.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    // Crear workbook
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Datos detallados
    const detailData: ExcelRowData[] = results.map(result => ({
      'Nombre Completo': `${result.colaborador.first_name} ${result.colaborador.last_name}`,
      'Np': result.colaborador.user_id,
      'Horas Extras': result.horasExtrasTrabajadas,
      'Valor Hora Extra Bruto': result.valorHoraExtra,
      'Total Horas Extras(Liquido)': result.result.montoTotalHorasExtras,
      'Bono Pactado (Liquido)': result.montoBonoPactado,
      'Diferencia Liquida': Math.max(0, result.result.diferenciaLiquida), // Mostrar 0 si es negativo
      'Diferencia Bruta': Math.max(0, result.result.diferenciaBruto) // Mostrar 0 si es negativo
    }));

    const detailWorksheet = XLSX.utils.json_to_sheet(detailData);
    detailWorksheet['!cols'] = [
      { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 20 },
      { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 18 }
    ];

    // Hoja 2: Resumen
    const totalColaboradores = results.length;
    const totalBonoPactado = results.reduce((sum, r) => sum + r.montoBonoPactado, 0);
    const totalDiferenciaLiquida = results.reduce((sum, r) => {
      // Solo sumar si la diferencia líquida es positiva
      return r.result.diferenciaLiquida > 0 ? sum + r.result.diferenciaLiquida : sum;
    }, 0);
    const totalDiferenciaBruta = results.reduce((sum, r) => {
      // Solo sumar si la diferencia bruta es positiva
      return r.result.diferenciaBruto > 0 ? sum + r.result.diferenciaBruto : sum;
    }, 0);
    const totalHorasExtras = results.reduce((sum, r) => sum + r.horasExtrasTrabajadas, 0);

    const summaryData = [
      { 'Concepto': 'Total Colaboradores', 'Valor': totalColaboradores },
      { 'Concepto': 'Total Horas Extras', 'Valor': totalHorasExtras },
      { 'Concepto': 'Total Bono Pactado', 'Valor': totalBonoPactado },
      { 'Concepto': 'Total Diferencia Líquida', 'Valor': totalDiferenciaLiquida },
      { 'Concepto': 'Total Diferencia Bruta', 'Valor': totalDiferenciaBruta },
      { 'Concepto': 'Fecha de Generación', 'Valor': new Date().toLocaleDateString('es-CL') }
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];

    // Agregar hojas al workbook
    XLSX.utils.book_append_sheet(workbook, detailWorksheet, 'Detalle por Colaborador');
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen General');

    // Generar nombre del archivo
    const defaultFileName = `bono_sabados_completo_${new Date().toISOString().split('T')[0]}.xlsx`;
    const finalFileName = fileName || defaultFileName;

    // Escribir y descargar el archivo
    XLSX.writeFile(workbook, finalFileName);

    console.log(`Archivo Excel con resumen exportado exitosamente: ${finalFileName}`);
  } catch (error) {
    console.error('Error al exportar a Excel con resumen:', error);
    throw new Error(`Error al exportar a Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Valida que los datos tengan la estructura correcta para exportación
 * @param results - Array de resultados a validar
 * @returns boolean indicando si los datos son válidos
 */
export const validateExportData = (results: any[]): boolean => {
  if (!Array.isArray(results) || results.length === 0) {
    return false;
  }

  return results.every(result => {
    return (
      result.colaborador &&
      typeof result.colaborador.first_name === 'string' &&
      typeof result.colaborador.last_name === 'string' &&
      typeof result.colaborador.user_id === 'number' &&
      typeof result.horasExtrasTrabajadas === 'number' &&
      typeof result.valorHoraExtra === 'number' &&
      typeof result.montoBonoPactado === 'number' &&
      result.result &&
      typeof result.result.montoTotalHorasExtras === 'number' &&
      typeof result.result.diferenciaLiquida === 'number' &&
      typeof result.result.diferenciaBruto === 'number'
    );
  });
};
