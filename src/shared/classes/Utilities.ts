import router from "../../routes/router";
import { ConfirmationState, useConfirmationStore } from "../../store/confirmation";
import { useLoaderStore } from "../../store/loader";
import { useToastStore } from "../../store/toast";
import { Assets } from "../constants/assets";
import { ToastsMessages } from '../constants/toast-messages';
import { CurrencyEnum } from "../enums/currency.enum";
import { LocaleEnum } from "../enums/locale.enum";
import { AssetFileEnum } from "../interfaces/assets.interface";
import { ToastBodyInterface, ToastGroupEnum, ToastSeverityMessageEnum, ToastTypeMessageEnum } from "../interfaces/toast-message.interface";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export class Utilities {
    
	// Elimina caracteres especiales, reemplaza tildes por vocales normales y la letra ñ por n
	static cleanText(text: string) {
		text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		text = text.replace(/[^\w\s-_.()]/gi, '').replace(/ñ/gi, 'n');
		return text;
	}

	// Formatear fecha
	static formatDate(date: Date | string, locale: LocaleEnum = LocaleEnum.ES) {
        let dateObj: Date;
        
        if (typeof date === 'string') {
            // Si el string viene en formato ISO (YYYY-MM-DD), tratarlo como fecha local
            if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Crear fecha local sin conversión de zona horaria
                const [year, month, day] = date.split('-').map(Number);
                dateObj = new Date(year, month - 1, day); // month es 0-indexed
            } else {
                // Para otros formatos, usar el constructor normal
                dateObj = new Date(date);
            }
        } else {
            dateObj = date;
        }

        // Determinar la zona horaria según el locale
        const timeZone = locale === LocaleEnum.ES ? 'America/Santiago' : 'UTC';
        
		const formattedDate = dateObj.toLocaleDateString(locale, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
            timeZone: timeZone
		}).replace(/\//g, '-');
        
		return formattedDate;
	}

    // Formatear hora
    static formatTime(date: Date) {
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const seconds = ("0" + date.getSeconds()).slice(-2);
        return `${hours}:${minutes}:${seconds}`;
    }

	// Formatear dinero
	static formatMoney(number: number, currency: CurrencyEnum, locale: LocaleEnum) {
		const formatNumber = new Intl.NumberFormat(locale.toString(), {
			style: "currency",
			currency: currency.toString(),
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		});
		return formatNumber.format(number);
	}

    // Esperar unos segundos
    static sleep(miliseconds: number) {
        return new Promise((res) => {
            setTimeout(() => {
                res(true);
            }, miliseconds);
        });
    }
    static formatNumber(number: number, locale: LocaleEnum = LocaleEnum.ES) {
        const formatNumber = new Intl.NumberFormat(locale.toString(), {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return formatNumber.format(number);
    }
    // Mostrar loader
    static showLoader(message: string | null = null) {
        useLoaderStore().show(message);
    }

    // Ocultar loader
    static hiddenLoader() {
        useLoaderStore().hidden();
    }

    // Mostrar modal de confirmación
    static showConfirmation(config:ConfirmationState) {
        useConfirmationStore().show(config);
    }

    // Navegar a otra ruta
    static navigate(name: string) {
        router.push({ name });
    }

    // Generar un mensaje toast
    static genToast(typeMessage: ToastTypeMessageEnum, life: number = 4500, group: ToastGroupEnum = ToastGroupEnum.TOP_RIGHT) {
        const message = ToastsMessages.find((m) => m.type == typeMessage);
        if (!message) return;
        const toastBody: ToastBodyInterface = {
            severity: message.severity,
            summary: message.summary,
            detail: message.detail,
            life,
            group
        };
        useToastStore().show(toastBody);
    }

    // Generar un mensaje personalizado toast
    static genCustomeToast(severity: ToastSeverityMessageEnum, summary: string, detail: string, life: number = 4500, group: ToastGroupEnum = ToastGroupEnum.TOP_RIGHT) {
        const toastBody: ToastBodyInterface = { severity, summary, detail, life, group };
        useToastStore().show(toastBody);
    }

    // Obtener archivo
    static getFile(fileName: AssetFileEnum) {
        return Assets.find(a => a.name == fileName)?.file;
    }

    // Formatear RUT
    static formatRut(rut: string): string {
        if (!rut) return '';
        // Elimina puntos y guión por si acaso
        rut = rut.replace(/\./g, '').replace(/-/g, '');
        if (rut.length < 2) return rut;
        const cuerpo = rut.slice(0, -1);
        const dv = rut.slice(-1);
        // Agrega puntos cada 3 dígitos desde el final
        const cuerpoFormateado = cuerpo
            .split('')
            .reverse()
            .join('')
            .replace(/(\d{3})(?=\d)/g, '$1.')
            .split('')
            .reverse()
            .join('');
        return `${cuerpoFormateado}-${dv}`;
    }
    // utils/exportToExcel.ts
    // Exportar a Excel con nombres de columnas personalizados
    static exportToExcel<T = any>(data: T[], filename: string = "finiquitos") {
        // Mapeo de claves originales a nombres de columnas amigables
        const COLUMN_MAP: Record<string, string> = {
            'np': 'NP',
            'first_name': 'Nombres',
            'last_name': 'Apellidos',
            'national_id': 'RUT',
            'anios_servicio': 'Cantidad de Años',
            'tiempo_servido': 'Cantidad meses tiempo servido',
            'saldo_en_dias': 'Saldo de vacaciones hábiles',
            'dias_inhabiles': 'Días Inhábiles',
            'total_dias': 'Total Días Vacaciones',
            'base_indemnizaciones': 'Base Indemnizaciones',
            'base_vacaciones': 'Base Vacaciones',
            'ias': 'Indemnización años de servicio', 
            'isap': 'Mes de aviso',
            'its': 'Indemnización tiempo servido',
            'ivac': 'Pago vacaciones',
            'descuento_afc': 'Descuento AFC',
            'total_finiquito': 'Total Finiquito',
            'fecha_desvinculacion': 'Fecha Desvinculación',
            'causal': 'Causal',
            'letra_causal': 'Letra Causal',
            'fecha_inset': 'Fecha Inset'
            }

        // Transformar los datos para usar los nombres amigables
        const customData = data.map(item => {
            const row: Record<string, any> = {};
            for (const key in COLUMN_MAP) {
                // Formatear fechas si es necesario
                if ((key === 'fecha_desvinculacion' || key === 'fecha_inset') && item[key as keyof typeof item]) {
                    const value = item[key as keyof typeof item];
                    // Validar que el valor sea string, number o Date antes de crear la fecha
                    if (
                        typeof value === 'string' ||
                        typeof value === 'number' ||
                        value instanceof Date
                    ) {
                        row[COLUMN_MAP[key]] = new Date(value).toLocaleDateString('es-CL');
                    } else {
                        // Si el valor no es válido para fecha, lo dejamos en blanco
                        row[COLUMN_MAP[key]] = '';
                    }
                } else {
                    row[COLUMN_MAP[key]] = item[key as keyof typeof item];
                }
            }
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(customData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `${filename}.xlsx`);
    }

}
