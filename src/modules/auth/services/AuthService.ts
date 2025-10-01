import axios from "axios";
import { ApiResponse } from "../../../shared/interfaces/api-response.interface";
import apiClient from "../../../shared/apiClient";
import { UserInfo } from "../../../store/user";

export class AuthService {

	static async verify(accessToken: string): Promise<UserInfo> {
        try {
            const response = await apiClient.post(`/api/auth/`, {
                id_token: accessToken
            })
            return response.data
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                return error.response.data
            }
            if (error.response && error.response.status === 500) {
                return error.response.data
            }
            throw error
        }
    }
	
    static async extendSession(): Promise<ApiResponse<string>> {
        const response = await apiClient.post(`/auth/extendSession/`, null)
        return response.data
    }
}