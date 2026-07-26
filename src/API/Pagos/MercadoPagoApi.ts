import api from "../axios";

export const MercadoPagoApi = {
    renovarPlan: async (userPlanId: number, isNative?: boolean): Promise<{ init_point: string, preferenceId: string }> => {
        const { data } = await api.post("/mp/renovar", { userPlanId, isNative });
        return data;
    },

    asignarPlan: async (planId: number): Promise<{ init_point: string, preferenceId: string }> => {
        const { data } = await api.post("/mp/asignar", { planId });
        return data;
    },

    getOAuthUrl: async (): Promise<{ url: string }> => {
        const { data } = await api.get("/mp/oauth/url");
        return data;
    }
};
