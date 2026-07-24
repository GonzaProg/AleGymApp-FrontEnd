import api from "../axios";

export const MercadoPagoApi = {
    renovarPlan: async (userPlanId: number): Promise<{ init_point: string, preferenceId: string }> => {
        const { data } = await api.post("/mp/renovar", { userPlanId });
        return data;
    },

    asignarPlan: async (planId: number): Promise<{ init_point: string, preferenceId: string }> => {
        const { data } = await api.post("/mp/asignar", { planId });
        return data;
    }
};
