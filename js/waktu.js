
    async function getLocationName(lat, lon) {
      const url = `/api/opencage?lat=${lat}&lon=${lon}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const locationText = data.city && data.country 
          ? `${data.city}, ${data.country}` 
          : `Koordinat: (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
        document.getElementById("location").textContent = `📍 Lokasi: ${locationText}`;
      } catch (error) {
        document.getElementById("location").textContent = "📍 Gagal mengambil nama lokasi";
      }
    }


    async function getPrayerTimes(lat, lon) {
      const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2&school=1&language=id`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const timings = data.data.timings;
        const hijri = data.data.date.hijri;

    
        document.getElementById("imsak").textContent = timings.Imsak;
        document.getElementById("fajr").textContent = timings.Fajr;
        document.getElementById("sunrise").textContent = timings.Sunrise;
        document.getElementById("dhuhr").textContent = timings.Dhuhr;
        document.getElementById("asr").textContent = timings.Asr;
        document.getElementById("maghrib").textContent = timings.Maghrib;
        document.getElementById("isha").textContent = timings.Isha;
        document.getElementById("hijriDate").textContent = `📅 ${hijri.day} ${hijri.month.en} ${hijri.year} H`;

   
        const audio = document.getElementById("adzanAudio");
        const now = new Date();
        const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        const prayerTimes = [
          timings.Fajr,
          timings.Dhuhr,
          timings.Asr,
          timings.Maghrib,
          timings.Isha
        ];

        if (prayerTimes.includes(currentTime)) {
          audio.play().catch(e => console.log("Auto-play terblokir:", e));
        }

      
        document.getElementById("loading").style.display = "none";

      } catch (error) {
        console.error("Gagal mengambil jadwal sholat:", error);
        document.getElementById("location").textContent = "⚠️ Gagal memuat jadwal sholat.";
        document.getElementById("loading").style.display = "none";
      }
    }

   
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          getPrayerTimes(lat, lon);
          getLocationName(lat, lon);
        },
        (err) => {
          document.getElementById("location").textContent = "❌ Gagal mendeteksi lokasi";
          document.getElementById("loading").style.display = "none";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      document.getElementById("location").textContent = "📍 Geolokasi tidak didukung";
      document.getElementById("loading").style.display = "none";
    }
