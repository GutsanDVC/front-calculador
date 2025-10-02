# Utilidades de Exportación - Módulo Bruto

Este directorio contiene utilidades para exportar datos del módulo de cálculo bruto a diferentes formatos.

## exportUtils.ts

### Funciones Disponibles

#### `exportBonoSabadosToExcel(results, fileName?)`
Exporta los resultados del cálculo de bono sábados a un archivo Excel básico.

**Parámetros:**
- `results`: Array de resultados de colaboradores
- `fileName`: Nombre del archivo (opcional, se genera automáticamente si no se proporciona)

**Columnas del Excel:**
- Nombre Completo
- Np (user_id)
- Horas Extras
- Valor Hora Extra Liquida
- Total Horas Extras
- Bono Pactado (Liquido)
- Diferencia Liquida
- Diferencia Bruta

#### `exportBonoSabadosWithSummary(results, fileName?)`
Exporta los resultados con información adicional de resumen en dos hojas:
1. **Detalle por Colaborador**: Datos individuales de cada colaborador
2. **Resumen General**: Totales y estadísticas generales

**Parámetros:**
- `results`: Array de resultados de colaboradores
- `fileName`: Nombre del archivo (opcional)

#### `validateExportData(results)`
Valida que los datos tengan la estructura correcta para exportación.

**Parámetros:**
- `results`: Array de datos a validar

**Retorna:**
- `boolean`: true si los datos son válidos, false en caso contrario

### Uso en Componentes

```typescript
import { 
  exportBonoSabadosToExcel, 
  exportBonoSabadosWithSummary,
  validateExportData 
} from '../Utils/exportUtils';

// Exportación básica
const handleExport = async () => {
  try {
    if (validateExportData(results)) {
      await exportBonoSabadosToExcel(results, 'mi_archivo.xlsx');
    }
  } catch (error) {
    console.error('Error al exportar:', error);
  }
};

// Exportación con resumen
const handleExportWithSummary = async () => {
  try {
    if (validateExportData(results)) {
      await exportBonoSabadosWithSummary(results);
    }
  } catch (error) {
    console.error('Error al exportar:', error);
  }
};
```

### Características

- **Formato automático**: Los números se formatean como moneda chilena
- **Encabezados estilizados**: Color corporativo (#DC2626) con texto blanco
- **Ancho de columnas optimizado**: Ajustado automáticamente para mejor legibilidad
- **Validación de datos**: Verificación de estructura antes de exportar
- **Manejo de errores**: Captura y reporte de errores durante la exportación
- **Nombres de archivo automáticos**: Incluyen fecha y hora si no se especifica

### Dependencias

- `xlsx`: Librería para manipulación de archivos Excel
- Ya está instalada en el proyecto (package.json línea 27)

### Notas Técnicas

- Los archivos se descargan automáticamente al navegador
- Compatible con Excel, LibreOffice Calc y Google Sheets
- Formato XLSX (Excel 2007+)
- Tamaño de archivo optimizado
