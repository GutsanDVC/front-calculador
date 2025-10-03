import { defineStore } from 'pinia';
import { Colaborador, ColaboradorForm, Finiquito, simularFiniquitoKiptor } from '../../repository/colaboradoresRepository';

export const useStepperStore = defineStore('stepper', {
    state: () => ({
        stepActive: 0,
        personasSeleccionadas: [] as Colaborador[],
        personasForm: [] as ColaboradorForm[],
        finiquitos: [] as Finiquito[],
    }),
    actions: {
        updatePersonaFormById(userId: number, form: ColaboradorForm) {
            const idx = this.personasForm.findIndex((p: ColaboradorForm) => p.user_id === userId);
            if (idx !== -1) {
                this.personasForm[idx] = form;
            }
        },
        setStepActive(step: number) {
            this.stepActive = step;
        },
        nextStep() {
            this.stepActive++;
            
        },
        prevStep() {
            if(this.stepActive==1)
                this.setPersonasSeleccionadas([]);
            if(this.stepActive==2)
                this.personasForm = [];
                this.finiquitos = [];
            this.stepActive--;
        },
        goHome() {
            this.stepActive = 0;
            this.personasForm = [];
            this.finiquitos = [];
            this.personasSeleccionadas = [];
        },
        setPersonasSeleccionadas(personas: any[]) {
            this.personasSeleccionadas = personas;
        },
        async simularFiniquito(persona: ColaboradorForm) {
            try {
              const response = await simularFiniquitoKiptor(persona);
              const body = await response.body;
              const finiquito: Finiquito = {
                np: String(persona.user_id),
                anios_servicio: body.anios_servicio,
                tiempo_servido: body.tiempo_servido,
                saldo_en_dias: body.vacaciones.saldo_en_dias,
                dias_inhabiles: body.vacaciones.dias_inhabiles,
                total_dias: body.vacaciones.total_dias,
                base_indemnizaciones: body.Bases.base_indemnizaciones,
                base_vacaciones: body.Bases.base_vacaciones,
                ias: body.indemnizaciones.IAS,
                isap: body.indemnizaciones.ISAP,
                its: body.indemnizaciones.ITS,
                ivac: body.indemnizaciones.IVAC,
                total_finiquito: body.total_finiquito,
                fecha_desvinculacion: persona.form.fecha_desvinculacion,
                causal: persona.form.causalTermino,
                letra_causal: persona.form.letraCausal,
                fecha_inset: new Date(),
                national_id: persona.national_id,
                first_name: persona.first_name,
                last_name: persona.last_name,
                descuento_afc: persona.form.descuentoAfc ? -persona.form.descuentoAfc : null
              };
              this.finiquitos.push(finiquito);
            } catch (error) {
              // Manejo de error: podrías agregar feedback visual aquí
              console.error('Error simulando finiquito para', persona.user_id, error);
            }
        }

    },
});
