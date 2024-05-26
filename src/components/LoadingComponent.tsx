import React, { useEffect, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useMiscLocalContext } from '../contexts/MixedLocalContext'; // Adjust the import path accordingly

const LoadingComponent: React.FC = () => {
  const { logs, getCurrentLog } = useMiscLocalContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentLog = getCurrentLog();
    if (currentLog) {
      setIsLoading(!currentLog.isClosed());
    } else {
      setIsLoading(false);
    }
  }, [logs]);

  if (!isLoading) {
    return <></>;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingComponent;
