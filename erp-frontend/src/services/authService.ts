import { api } from './api';

export interface LoginRequestDTO {
  email: string;
  senha: string;
}

export interface LoginResponseDTO {
  token: string;
}

export const authService = {
  login: async (credenciais: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const url = '/auth/login'; 

    const response = await api.post<LoginResponseDTO>(url, credenciais);
    return response.data;
  },

  logout: () => {
    localStorage.clear();
  }
};