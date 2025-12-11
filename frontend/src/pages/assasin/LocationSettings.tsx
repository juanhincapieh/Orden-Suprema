import { useState, useEffect } from 'react';
import { MapPin, Navigation, Save, Loader } from 'lucide-react';
import styles from './Assassin.module.css';

interface LocationSettingsProps {
  userEmail: string;
  isSpanish: boolean;
  onLocationUpdate?: () => void;
}

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  useAutoLocation: boolean;
}

export const LocationSettings = ({ userEmail, isSpanish, onLocationUpdate }: LocationSettingsProps) => {
  const [useAutoLocation, setUseAutoLocation] = useState(true);
  const [manualAddress, setManualAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar configuración guardada
  useEffect(() => {
    const stored = localStorage.getItem('assassinLocations');
    const locations = stored ? JSON.parse(stored) : {};
    const savedLocation = locations[userEmail];
    
    if (savedLocation) {
      setUseAutoLocation(savedLocation.useAutoLocation ?? true);
      setManualAddress(savedLocation.address || '');
      if (savedLocation.lat && savedLocation.lng) {
        setCurrentLocation({ lat: savedLocation.lat, lng: savedLocation.lng });
      }
    }
  }, [userEmail]);

  // Obtener ubicación automática
  const getAutoLocation = () => {
    setIsLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(isSpanish ? 'Geolocalización no soportada' : 'Geolocation not supported');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLoadingLocation(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(
          isSpanish 
            ? 'No se pudo obtener la ubicación. Verifica los permisos.'
            : 'Could not get location. Check permissions.'
        );
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Geocodificar dirección manual
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  // Guardar configuración
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let locationData: LocationData;

      if (useAutoLocation) {
        if (!currentLocation) {
          setError(isSpanish ? 'Primero obtén tu ubicación' : 'First get your location');
          setIsSaving(false);
          return;
        }
        locationData = {
          ...currentLocation,
          useAutoLocation: true
        };
      } else {
        if (!manualAddress.trim()) {
          setError(isSpanish ? 'Ingresa una dirección' : 'Enter an address');
          setIsSaving(false);
          return;
        }

        const coords = await geocodeAddress(manualAddress);
        if (!coords) {
          setError(isSpanish ? 'No se pudo encontrar la dirección' : 'Could not find address');
          setIsSaving(false);
          return;
        }

        locationData = {
          ...coords,
          address: manualAddress,
          useAutoLocation: false
        };
        setCurrentLocation(coords);
      }

      // Guardar en localStorage
      const stored = localStorage.getItem('assassinLocations');
      const locations = stored ? JSON.parse(stored) : {};
      locations[userEmail] = locationData;
      localStorage.setItem('assassinLocations', JSON.stringify(locations));

      // También actualizar el perfil del asesino
      const profiles = localStorage.getItem('assassinProfiles');
      const profilesDict = profiles ? JSON.parse(profiles) : {};
      if (!profilesDict[userEmail]) {
        profilesDict[userEmail] = {};
      }
      profilesDict[userEmail].location = { lat: locationData.lat, lng: locationData.lng };
      profilesDict[userEmail].address = locationData.address;
      profilesDict[userEmail].useAutoLocation = locationData.useAutoLocation;
      localStorage.setItem('assassinProfiles', JSON.stringify(profilesDict));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      if (onLocationUpdate) {
        onLocationUpdate();
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(isSpanish ? 'Error al guardar' : 'Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.locationSettings}>
      <h3 className={styles.locationTitle}>
        <MapPin size={20} />
        {isSpanish ? 'Configuración de Ubicación' : 'Location Settings'}
      </h3>

      <div className={styles.locationOptions}>
        <label className={styles.locationOption}>
          <input
            type="radio"
            name="locationType"
            checked={useAutoLocation}
            onChange={() => setUseAutoLocation(true)}
          />
          <span>{isSpanish ? 'Usar mi ubicación actual' : 'Use my current location'}</span>
        </label>

        <label className={styles.locationOption}>
          <input
            type="radio"
            name="locationType"
            checked={!useAutoLocation}
            onChange={() => setUseAutoLocation(false)}
          />
          <span>{isSpanish ? 'Especificar dirección' : 'Specify address'}</span>
        </label>
      </div>

      {useAutoLocation ? (
        <div className={styles.autoLocationSection}>
          <button
            type="button"
            className={styles.getLocationButton}
            onClick={getAutoLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <><Loader size={18} className={styles.spinning} /> {isSpanish ? 'Obteniendo...' : 'Getting...'}</>
            ) : (
              <><Navigation size={18} /> {isSpanish ? 'Obtener ubicación' : 'Get location'}</>
            )}
          </button>
          
          {currentLocation && (
            <p className={styles.locationInfo}>
              📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
          )}
        </div>
      ) : (
        <div className={styles.manualLocationSection}>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder={isSpanish ? 'Ej: Calle 100 #15-20, Bogotá' : 'Ex: 123 Main St, New York'}
            className={styles.addressInput}
          />
          <p className={styles.addressHint}>
            {isSpanish 
              ? 'Ingresa una dirección completa para mejor precisión'
              : 'Enter a complete address for better accuracy'}
          </p>
        </div>
      )}

      {error && <p className={styles.locationError}>{error}</p>}
      {success && (
        <p className={styles.locationSuccess}>
          {isSpanish ? '✓ Ubicación guardada correctamente' : '✓ Location saved successfully'}
        </p>
      )}

      <button
        type="button"
        className={styles.saveLocationButton}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <><Loader size={18} className={styles.spinning} /> {isSpanish ? 'Guardando...' : 'Saving...'}</>
        ) : (
          <><Save size={18} /> {isSpanish ? 'Guardar ubicación' : 'Save location'}</>
        )}
      </button>
    </div>
  );
};
