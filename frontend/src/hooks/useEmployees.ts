import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeFilters,
} from '@/types/employee';
import { employeeService } from '@/services/employeeService';

export interface UseEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  createEmployee: (data: CreateEmployeeRequest) => Promise<void>;
  updateEmployee: (id: string, data: UpdateEmployeeRequest) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  fetchEmployees: (filters?: EmployeeFilters) => Promise<void>;
  fetchEmployeeById: (id: string) => Promise<Employee | null>;
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Busca lista de funcionários com filtros opcionais
   */
  const fetchEmployees = useCallback(async (filters?: EmployeeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeService.getAllEmployees(filters);
      setEmployees(data);
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Erro ao carregar funcionários';
      setError(message);
      
      // Redireciona se não autenticado (401)
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Cria um novo funcionário
   */
  const createEmployee = useCallback(async (data: CreateEmployeeRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newEmployee = await employeeService.createEmployee(data);
      setEmployees((prev) => [...prev, newEmployee]);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        'Erro ao criar funcionário. Verifique os dados.';
      setError(message);
      throw err; // Re-throw para que o componente possa lidar
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza um funcionário existente
   */
  const updateEmployee = useCallback(
    async (id: string, data: UpdateEmployeeRequest) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await employeeService.updateEmployee(id, data);
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id ? updated : emp))
        );
      } catch (err: any) {
        const message =
          err.response?.data?.error ||
          'Erro ao atualizar funcionário. Verifique os dados.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Deleta um funcionário
   */
  const deleteEmployee = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await employeeService.deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        'Erro ao deletar funcionário. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca um funcionário por ID
   */
  const fetchEmployeeById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const employee = await employeeService.getEmployeeById(id);
      return employee;
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Erro ao carregar funcionário';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployees,
    fetchEmployeeById,
  };
}
