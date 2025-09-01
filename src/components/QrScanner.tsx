"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { motion } from 'framer-motion'; // Import motion
import { Camera, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import Input from './ui/Input';

interface QrScannerProps {
  onCodeDetected?: (code: string) => void;
  onScan?: (code: string | null) => void;
  onError?: (err: any) => void;
  autoStart?: boolean;
}

const QrScanner: React.FC<QrScannerProps> = ({ onCodeDetected, onScan, onError, autoStart = false }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = "qr-scanner-region"; // ID for the scanner element

  useEffect(() => {
    // Initialize Html5Qrcode on component mount if not already initialized
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(scannerRegionId, { verbose: false });
    }

    const html5QrCode = scannerRef.current;

    // Cleanup function to stop scanning when component unmounts or before restarting
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => {
          console.error("Failed to stop QR scanner:", err);
        });
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current) {
      toast.error("Skener není inicializován.");
      return;
    }
    setScanError(null);
    setIsScanning(true);

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setScanError("Nebyly nalezeny žádné kamery.");
        toast.error("Nebyly nalezeny žádné kamery.");
        setIsScanning(false);
        setPermissionGranted(false);
        return;
      }
      setPermissionGranted(true);

      await scannerRef.current.start(
        { facingMode: "environment" }, // Prefer rear camera
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7); // Make QR box 70% of the smaller edge
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0, // Square aspect ratio for the scanning box
        },
        // success callback
        (decodedText: string) => {
          stopScanner();
          toast.success("QR kód úspěšně naskenován!");
          if (onCodeDetected) onCodeDetected(decodedText);
          if (onScan) onScan(decodedText);
        },
        // error callback
        (errorMessage: string) => {
          // This callback is called frequently, only log actual errors or specific messages
          if (errorMessage.includes("NotFoundException")) {
            // This is common when no QR code is in view, not necessarily an "error"
          } else if (errorMessage.includes("PERMISSION_DENIED")) {
            setScanError("Přístup ke kameře byl odepřen.");
            toast.error("Přístup ke kameře byl odepřen. Povolte prosím přístup v nastavení prohlížeče.");
            setIsScanning(false);
            setPermissionGranted(false);
            if (onError) onError(new Error("Camera permission denied"));
          } else {
            // console.warn(`QR Scanner warning: ${errorMessage}`);
          }
        }
      );
    } catch (err: any) {
      console.error("Chyba při startu QR skeneru:", err);
      let friendlyMessage = "Chyba při startu skeneru.";
      if (err.name === "NotAllowedError" || (err.message && err.message.includes("Permission denied"))) {
        friendlyMessage = "Přístup ke kameře byl odepřen. Povolte prosím přístup v nastavení prohlížeče.";
        setPermissionGranted(false);
      } else if (err.message && err.message.includes("Requested camera not available")) {
        friendlyMessage = "Vybraná kamera není dostupná.";
      }
      setScanError(friendlyMessage);
      toast.error(friendlyMessage);
      setIsScanning(false);
  if (onError) onError(err);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch(err => {
          console.error("Chyba při zastavení QR skeneru:", err);
          setScanError("Chyba při zastavení skeneru.");
          // Even if stop fails, update UI state
          setIsScanning(false);
        });
    } else {
        setIsScanning(false); // Ensure state is updated if not scanning
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
  if (onCodeDetected) onCodeDetected(manualCode.trim());
  if (onScan) onScan(manualCode.trim());
      setManualCode('');
    } else {
      toast.error("Zadejte prosím kód chatu.");
    }
  };

  useEffect(() => {
    if (autoStart) {
      // Check for camera permission before auto-starting
      navigator.permissions?.query({ name: 'camera' as PermissionName }).then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          setPermissionGranted(true);
          startScanner();
        } else if (permissionStatus.state === 'prompt') {
          setPermissionGranted(null); // Will ask when startScanner is called
           // startScanner(); // Or decide to wait for user interaction
        } else {
          setPermissionGranted(false);
          toast.error("Přístup ke kameře je blokován. Povolte jej prosím v nastavení prohlížeče.");
        }
        permissionStatus.onchange = () => {
          setPermissionGranted(permissionStatus.state === 'granted');
        };
      }).catch(() => {
        // Permissions API might not be supported or other error
        // Fallback to attempting to start and letting it handle errors
        if(autoStart) startScanner();
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 border rounded-lg shadow-md bg-white max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold text-center mb-4 text-text-primary">Připojit se k chatu</h2>

      {/* Scanner Region and Controls */}
      <div id={scannerRegionId} className={`w-full rounded-md overflow-hidden border ${isScanning ? 'border-primary' : 'border-gray-300'} ${!isScanning && permissionGranted === false ? 'bg-gray-100' : ''}`} style={{ minHeight: isScanning ? '250px' : 'auto' }}>
        {!isScanning && permissionGranted === false && (
          <div className="p-4 text-center text-red-600">
            <AlertTriangle size={48} className="mx-auto mb-2" />
            Přístup ke kameře byl odepřen nebo není kamera dostupná. Zkuste povolit přístup v nastavení prohlížeče nebo zadejte kód ručně.
          </div>
        )}
      </div>

      {scanError && !isScanning && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm text-center mt-2 flex items-center justify-center"
        >
          <XCircle size={18} className="mr-1" /> {scanError}
        </motion.p>
      )}
      {permissionGranted === true && isScanning && (
         <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="text-green-600 text-sm text-center mt-2 flex items-center justify-center"
         >
          <CheckCircle size={18} className="mr-1" /> Kamera aktivní. Namiřte na QR kód.
        </motion.p>
      )}


      {!isScanning ? (
        <Button
          onClick={startScanner}
          leftIcon={<Camera size={18} />}
          className="w-full mt-4"
          variant="secondary"
          disabled={permissionGranted === false && !autoStart} // Disable if permission explicitly denied and not auto-starting
        >
          Spustit skener QR kódu
        </Button>
      ) : (
        <Button
          onClick={stopScanner}
          leftIcon={<XCircle size={18} />}
          variant="danger"
          className="w-full mt-4"
        >
          Zastavit skener
        </Button>
      )}

      {/* Manual Code Entry */}
      <form onSubmit={handleManualSubmit} className="mt-6">
        <p className="text-center text-text-secondary my-3">nebo zadejte kód ručně:</p>
            <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())} // Convert to uppercase for consistency
            placeholder="KÓD CHATU"
            aria-label="Kód chatu"
                wrapperClassName="flex-grow" // Input's wrapper will handle growth
          />
              <Button type="submit" variant="primary" className="sm:w-auto w-full"> {/* Adjusted width for stacking */}
            Připojit
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default QrScanner;
