import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './AssassinMap.module.css';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Assassin {
  id: string;
  name: string;
  email: string;
  rating: number;
  completedContracts: number;
  location?: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'busy' | 'inactive';
}

interface AssassinMapProps {
  assassins: Assassin[];
  selectedAssassinId?: string;
  onAssassinClick?: (assassinId: string) => void;
  isSpanish?: boolean;
}

export const AssassinMap = ({ 
  assassins, 
  selectedAssassinId, 
  onAssassinClick,
  isSpanish = false 
}: AssassinMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    // Inicializar el mapa centrado en Bogotá
    if (!mapRef.current) {
      mapRef.current = L.map('assassin-map').setView([4.6097, -74.0817], 12);

      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    return () => {
      // Limpiar el mapa al desmontar
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores existentes
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Agregar marcadores para cada asesino
    assassins.forEach(assassin => {
      if (!assassin.location || !mapRef.current) return;

      // Crear icono personalizado según el estado
      const iconColor = assassin.status === 'available' 
        ? '#4ade80' 
        : assassin.status === 'busy' 
        ? '#f59e0b' 
        : '#ef4444';

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${iconColor};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 14px;
            cursor: pointer;
            ${selectedAssassinId === assassin.id ? 'transform: scale(1.3); z-index: 1000;' : ''}
          ">
            ${assassin.name.charAt(0)}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      // Crear marcador
      const marker = L.marker([assassin.location.lat, assassin.location.lng], {
        icon: customIcon,
      }).addTo(mapRef.current);

      // Agregar popup con información
      const statusText = assassin.status === 'available'
        ? (isSpanish ? 'Disponible' : 'Available')
        : assassin.status === 'busy'
        ? (isSpanish ? 'Ocupado' : 'Busy')
        : (isSpanish ? 'Inactivo' : 'Inactive');

      marker.bindPopup(`
        <div style="text-align: center; min-width: 150px;">
          <strong style="font-size: 16px;">${assassin.name}</strong><br/>
          <span style="color: ${iconColor}; font-weight: 600;">● ${statusText}</span><br/>
          <span style="font-size: 14px;">⭐ ${assassin.rating.toFixed(1)}</span><br/>
          <span style="font-size: 12px; color: #666;">✓ ${assassin.completedContracts} ${isSpanish ? 'contratos' : 'contracts'}</span>
        </div>
      `);

      // Agregar evento de click
      marker.on('click', () => {
        if (onAssassinClick) {
          onAssassinClick(assassin.id);
        }
      });

      // Guardar referencia del marcador
      markersRef.current[assassin.id] = marker;
    });

    // Si hay un asesino seleccionado, centrar el mapa en él
    if (selectedAssassinId) {
      const selectedAssassin = assassins.find(a => a.id === selectedAssassinId);
      if (selectedAssassin?.location && mapRef.current) {
        mapRef.current.setView(
          [selectedAssassin.location.lat, selectedAssassin.location.lng],
          15,
          { animate: true }
        );
        // Abrir el popup del asesino seleccionado
        markersRef.current[selectedAssassinId]?.openPopup();
      }
    }
  }, [assassins, selectedAssassinId, onAssassinClick, isSpanish]);

  return (
    <div className={styles.mapContainer}>
      <div id="assassin-map" className={styles.map}></div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#4ade80' }}></span>
          <span>{isSpanish ? 'Disponible' : 'Available'}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#f59e0b' }}></span>
          <span>{isSpanish ? 'Ocupado' : 'Busy'}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#ef4444' }}></span>
          <span>{isSpanish ? 'Inactivo' : 'Inactive'}</span>
        </div>
      </div>
    </div>
  );
};
