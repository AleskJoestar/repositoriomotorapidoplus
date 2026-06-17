import api from './api';
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeFilters,
} from '@/types/employee';

export const employeeService = {
  /**
   * Cria um novo funcionário
   */
  createEmployee: async (data: CreateEmployeeRequest): Promise<Employee> => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  /**
   * Obtém lista de funcionários com filtros opcionais
   */
  getAllEmployees: async (filters?: EmployeeFilters): Promise<Employee[]> => {
    const response = await api.get('/employees', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtém um funcionário pelo ID
   */
  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  /**
   * Atualiza um funcionário
   */
  updateEmployee: async (
    id: string,
    data: UpdateEmployeeRequest
  ): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  /**
   * Deleta um funcionário
   */
  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
};
