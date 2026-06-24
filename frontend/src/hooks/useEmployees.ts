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
  reactivateEmployee: (id: string) => Promise<void>;
  fetchEmployees: (filters?: EmployeeFilters) => Promise<void>;
  fetchEmployeeById: (id: string) => Promise<Employee | null>;
  downloadReportPdf: (filters?: EmployeeFilters) => Promise<void>;
  downloadReportXlsx: (filters?: EmployeeFilters) => Promise<void>;
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
          prev.map((emp) => (emp.id === Number(id) ? updated : emp))
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
      const updated = await employeeService.deleteEmployee(id);
      setEmployees((prev) =>
        prev.some((emp) => emp.id === Number(id))
          ? prev.map((emp) => (emp.id === Number(id) ? updated : emp))
          : prev.filter((emp) => emp.id !== Number(id))
      );
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

  const reactivateEmployee = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await employeeService.reactivateEmployee(id);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === Number(id) ? updated : emp))
      );
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Erro ao reativar funcionário.';
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

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadReportPdf = useCallback(async (filters?: EmployeeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await employeeService.downloadReportPdf(filters);
      downloadFile(blob, `relatorio-funcionarios-${Date.now()}.pdf`);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao exportar PDF';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReportXlsx = useCallback(async (filters?: EmployeeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await employeeService.downloadReportXlsx(filters);
      downloadFile(blob, `relatorio-funcionarios-${Date.now()}.xlsx`);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao exportar XLSX';
      setError(message);
      throw err;
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
    reactivateEmployee,
    fetchEmployees,
    fetchEmployeeById,
    downloadReportPdf,
    downloadReportXlsx,
  };
}
