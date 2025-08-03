   (() => {
      const arrow = document.getElementById('arrow');
      const directionText = document.getElementById('direction-text');
      const statusText = document.getElementById('status');
      const compassContainer = document.getElementById('compass-container');
      const permissionInfo = document.getElementById('location-permission');
      const btnRequestPermission = document.getElementById('request-permission');

      const kaabaCoords = { lat: 21.422487, lon: 39.826206 };

      let userHeading = null;
      let smoothedHeading = null;
      let bearingToKaaba = 0;
      let locationGranted = false;
      let orientationGranted = false;

      function toRadians(deg) {
        return deg * Math.PI / 180;
      }

      function toDegrees(rad) {
        return rad * 180 / Math.PI;
      }

      function calculateBearing(lat1, lon1, lat2, lon2) {
        const φ1 = toRadians(lat1);
        const φ2 = toRadians(lat2);
        const Δλ = toRadians(lon2 - lon1);
        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                  Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        let θ = Math.atan2(y, x);
        θ = toDegrees(θ);
        return (θ + 360) % 360; // Normalize to 0-360
      }

   
      function smoothHeading(newHeading) {
        if (smoothedHeading === null) {
          smoothedHeading = newHeading;
          return smoothedHeading;
        }
        const diff = ((newHeading - smoothedHeading + 540) % 360) - 180;
        smoothedHeading = (smoothedHeading + diff * 0.1 + 360) % 360;
        return smoothedHeading;
      }

      function updateCompass() {
        if (!locationGranted || !orientationGranted || smoothedHeading === null) {
          return;
        }
        const angle = (bearingToKaaba - smoothedHeading + 360) % 360;
        arrow.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
        directionText.textContent = `Arah kiblat: ${Math.round(angle)}° dari utara`;
        statusText.textContent = 'Kompas aktif dan siap.';
      }

      function successPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        bearingToKaaba = calculateBearing(lat, lon, kaabaCoords.lat, kaabaCoords.lon);
        locationGranted = true;
        permissionInfo.textContent = '';
        btnRequestPermission.style.display = 'none';
        compassContainer.classList.remove('hidden');
        directionText.textContent = 'Kalibrasi kompas...';
        statusText.textContent = '';
      }

      function errorPosition() {
        permissionInfo.textContent = 'Gagal mendapatkan lokasi. Aktifkan izin lokasi dan coba lagi.';
        statusText.textContent = '';
        directionText.textContent = '';
      }

      function handleOrientation(event) {
        if (event.absolute === true || event.absolute === false) {
          let heading;
          if (event.webkitCompassHeading !== undefined) {
            heading = event.webkitCompassHeading; 
          } else if (event.alpha !== null) {
            heading = 360 - event.alpha;
          } else {
            statusText.textContent = 'Perangkat tidak mendukung sensor orientasi.';
            return;
          }
          userHeading = heading;
          smoothedHeading = smoothHeading(userHeading);
          orientationGranted = true;
        } else {
          statusText.textContent = 'Sensor orientasi tidak didukung pada perangkat ini.';
        }
      }

      function animationLoop() {
        updateCompass();
        window.requestAnimationFrame(animationLoop);
      }

      function askOrientationPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
            .then(response => {
              if (response === 'granted') {
                window.addEventListener('deviceorientationabsolute', handleOrientation, true);
                window.addEventListener('deviceorientation', handleOrientation, true);
                orientationGranted = true;
                animationLoop();
              } else {
                permissionInfo.textContent = 'Akses sensor kompas ditolak. Arah kiblat tidak bisa ditampilkan.';
              }
            })
            .catch(() => {
              permissionInfo.textContent = 'Akses sensor kompas bermasalah.';
            });
        } else {
          window.addEventListener('deviceorientationabsolute', handleOrientation, true);
          window.addEventListener('deviceorientation', handleOrientation, true);
          orientationGranted = true;
          animationLoop();
        }
      }

      function requestPermissions() {
        permissionInfo.textContent = 'Meminta izin lokasi...';
        if (!navigator.geolocation) {
          permissionInfo.textContent = 'Geolokasi tidak didukung di browser ini.';
          return;
        }
        navigator.geolocation.getCurrentPosition(successPosition, errorPosition, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        askOrientationPermission();
      }

      btnRequestPermission.addEventListener('click', () => {
        requestPermissions();
      });
    })();
