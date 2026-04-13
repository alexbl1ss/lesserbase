import { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import currentVersion from './version';

export default function VersionChecker() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch('/version.json', { cache: 'no-store' });
        const data = await res.json();
        if (data.version !== currentVersion) {
          setOpen(true);
        }
      } catch (err) {
        console.warn('Version check failed:', err);
      }
    };

    const interval = setInterval(checkVersion, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload(true);
  };

  return (
    <Snackbar open={open} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Refresh
          </Button>
        }
      >
        A new version is available.
      </Alert>
    </Snackbar>
  );
}
