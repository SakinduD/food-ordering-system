import React, { useState, useRef } from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from "@react-google-maps/api";
import Modal from 'react-modal';
import LandingPage from '../../pages/landing-page/LandingPage';

const libraries = ['places'];

const LocationPicker = ({ isOpen, onClose, onLocationSelect }) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [tempLocation, setTempLocation] = useState({ lat: 6.9271, lng: 79.8612 });
    const autocompleteRef = useRef(null);

    const handleMapClick = (e) => {
        setTempLocation({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        });
    };

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setTempLocation({ lat, lng });
        }
    };

    const handleConfirm = () => {
        onLocationSelect(tempLocation);
        onClose();
    };

    if (!isLoaded) return <div> <LandingPage/> </div>;

    return (
        <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Pick Location"
        style={{
            content: {
            top: '10%',
            left: '10%',
            right: '10%',
            bottom: '10%',
            },
        }}
        >
        <h2 className="text-lg font-bold mb-2">Select Delivery Location</h2>

        <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}
        >
            <input
            type="text"
            placeholder="Search for a location"
            className="w-full p-2 border mb-3 rounded"
            />
        </Autocomplete>

        <GoogleMap
            zoom={10}
            center={tempLocation}
            mapContainerStyle={{ width: "100%", height: "75%" }}
            onClick={handleMapClick}
        >
            <Marker position={tempLocation} />
        </GoogleMap>

        <div className="mt-4 flex justify-end gap-2">
            <button onClick={handleConfirm} className="bg-blue-500 text-white px-4 py-2 rounded">
                Confirm
            </button>
            <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
            </button>
        </div>
        </Modal>
    );
};

export default LocationPicker;
