import React from 'react';
import { Outlet } from 'react-router-dom';

export const UppercaseLayout: React.FC = () => (
  <div className="uppercase [&_input]:uppercase [&_textarea]:uppercase [&_select]:uppercase [&_option]:uppercase">
    <Outlet />
  </div>
);
