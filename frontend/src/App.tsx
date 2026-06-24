import React from 'react';



import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';



import { AuthProvider } from '@/context/AuthContext';

import { UppercaseLayout } from '@/components/UppercaseLayout';

import { Login } from '@/pages/Login';

import { Dashboard } from '@/pages/Dashboard';

import { AdminRoute } from '@/pages/AdminRoute';

import { MasterRoute } from '@/pages/MasterRoute';

import { HomeRedirect } from '@/pages/HomeRedirect';

import { ProtectedRoute } from '@/pages/ProtectedRoute';

import { PdvRoute } from '@/pages/PdvRoute';

import { Employees } from '@/pages/Employees';

import { EmployeeFormPage } from '@/pages/EmployeeFormPage';

import { Parts } from '@/pages/Parts';

import { PartFormPage } from '@/pages/PartFormPage';

import { Departments } from '@/pages/Departments';

import { DepartmentFormPage } from '@/pages/DepartmentFormPage';

import { Manufacturers } from '@/pages/Manufacturers';

import { ManufacturerFormPage } from '@/pages/ManufacturerFormPage';

import { Categories } from '@/pages/Categories';

import { CategoryFormPage } from '@/pages/CategoryFormPage';

import { Users } from '@/pages/Users';

import { UserFormPage } from '@/pages/UserFormPage';

import { Sales } from '@/pages/Sales';

import { SalesReport } from '@/pages/SalesReport';



const App: React.FC = () => {

  return (

    <Router>

      <AuthProvider>

        <Routes>

          <Route path="/login" element={<Login />} />

          <Route

            path="/users/new"

            element={

              <MasterRoute>

                <div className="normal-case">

                  <UserFormPage />

                </div>

              </MasterRoute>

            }

          />

          <Route

            path="/users/:id/edit"

            element={

              <MasterRoute>

                <div className="normal-case">

                  <UserFormPage />

                </div>

              </MasterRoute>

            }

          />



          <Route element={<UppercaseLayout />}>

            <Route

              path="/dashboard"

              element={

                <AdminRoute>

                  <Dashboard />

                </AdminRoute>

              }

            />

            <Route

              path="/employees"

              element={

                <AdminRoute>

                  <Employees />

                </AdminRoute>

              }

            />

            <Route

              path="/employees/new"

              element={

                <AdminRoute>

                  <EmployeeFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/employees/:id/edit"

              element={

                <AdminRoute>

                  <EmployeeFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/sales/report"

              element={

                <MasterRoute>

                  <SalesReport />

                </MasterRoute>

              }

            />



            <Route

              path="/sales"

              element={

                <PdvRoute>

                  <Sales />

                </PdvRoute>

              }

            />



            <Route

              path="/parts"

              element={

                <PdvRoute>

                  <Parts />

                </PdvRoute>

              }

            />

            <Route

              path="/parts/new"

              element={

                <AdminRoute>

                  <PartFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/parts/:id/edit"

              element={

                <AdminRoute>

                  <PartFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/departments"

              element={

                <AdminRoute>

                  <Departments />

                </AdminRoute>

              }

            />

            <Route

              path="/departments/new"

              element={

                <AdminRoute>

                  <DepartmentFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/departments/:id/edit"

              element={

                <AdminRoute>

                  <DepartmentFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/manufacturers"

              element={

                <AdminRoute>

                  <Manufacturers />

                </AdminRoute>

              }

            />

            <Route

              path="/manufacturers/new"

              element={

                <AdminRoute>

                  <ManufacturerFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/manufacturers/:id/edit"

              element={

                <AdminRoute>

                  <ManufacturerFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/categories"

              element={

                <AdminRoute>

                  <Categories />

                </AdminRoute>

              }

            />

            <Route

              path="/categories/new"

              element={

                <AdminRoute>

                  <CategoryFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/categories/:id/edit"

              element={

                <AdminRoute>

                  <CategoryFormPage />

                </AdminRoute>

              }

            />

            <Route

              path="/users"

              element={

                <MasterRoute>

                  <Users />

                </MasterRoute>

              }

            />

            <Route path="/register" element={<Navigate to="/login" replace />} />

            <Route path="/" element={<HomeRedirect />} />

            <Route path="*" element={<HomeRedirect />} />

          </Route>

        </Routes>

      </AuthProvider>

    </Router>

  );

};



export default App;


