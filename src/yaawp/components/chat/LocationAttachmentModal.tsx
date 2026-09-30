// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import { LocationData } from '../../types';
import { MapPin, Navigation, X, Check, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

interface LocationAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendLocation: (loc: LocationData) => void;
}

export const LocationAttachmentModal: React.FC<LocationAttachmentModalProps> = ({
  isOpen,
  onClose,
  onSendLocation,
}) => {
  const { requestAppPermission } = useApp();
  const [selectedLoc, setSelectedLoc] = useState<LocationData | null>(null);
  const [customName, setCustomName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen) return null;

  const handleUseCurrentLocation = async () => {
    const granted = await requestAppPermission('location', 'sharing your live location');
    if (!granted) return;

    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIsLocating(false);
          const loc: LocationData = {
            name: 'Live GPS Location',
            address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setSelectedLoc(loc);
          setCustomName(loc.name);
          setCustomAddress(loc.address);
        },
        () => {
          setIsLocating(false);
          const loc: LocationData = {
            name: 'My Location',
            address: 'GPS coordinates unavailable',
            latitude: 0,
            longitude: 0,
          };
          setSelectedLoc(loc);
          setCustomName(loc.name);
          setCustomAddress(loc.address);
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSend = () => {
    if (selectedLoc) {
      onSendLocation({
        ...selectedLoc,
        name: customName.trim() || selectedLoc.name,
        address: customAddress.trim() || selectedLoc.address
      });
    } else if (customName.trim()) {
      onSendLocation({
        name: customName.trim(),
        address: customAddress.trim() || 'Custom pin location',
        latitude: 0,
        longitude: 0
      });
    }
    onClose();
  };

  const isReady = Boolean(selectedLoc || customName.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Share Location
              </h3>
              <p className="text-[11px] text-slate-500">
                Send GPS location or custom place pin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current GPS Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold">
                {isLocating ? 'Detecting device GPS...' : 'Use Current Live Location'}
              </span>
              <span className="text-[10px] text-rose-500/80">
                Share real-time GPS coordinates
              </span>
            </div>
          </button>

          {/* Custom Place Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Or specify a location:
            </span>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Place Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Blue Bottle Coffee, Office, Gym"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Address or City
                </label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={e => setCustomAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, New York, NY"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!isReady}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
          >
            Share Location
          </button>
        </div>
      </motion.div>
    </div>
  );
};
