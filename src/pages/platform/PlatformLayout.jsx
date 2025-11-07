import React from 'react';
import { Outlet } from 'react-router-dom';
import PlatformNavigation from '../../components/platform/PlatformNavigation';

const PlatformLayout = () => {
  return (
    <PlatformNavigation>
      <Outlet />
    </PlatformNavigation>
  );
};

export default PlatformLayout;
