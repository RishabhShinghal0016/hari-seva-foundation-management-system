// Uses the browser's built-in Geolocation API (no key needed) plus OpenStreetMap's
// free Nominatim reverse-geocoding service to turn coordinates into a readable
// address. Runs entirely client-side.
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location isn't supported on this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("Location access was denied. You can still type your address manually."));
        } else {
          reject(new Error("Couldn't get your location. You can still type your address manually."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export async function reverseGeocode(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Couldn't look up that address.");
  const data = await res.json();
  if (!data.display_name) throw new Error("Couldn't find an address for your location.");
  return data.display_name;
}
