const CHANNEL_ID   = '3393031';
const READ_API_KEY = 'G37RBDRB8Z5799LY';
const SOURCE_KEY   = 'nutrix_step_source'; // 'google_fit' | 'pedometer' | 'none'

export function getStepSource() {
    return localStorage.getItem(SOURCE_KEY) || 'none';
}

export function setStepSource(source) {
    localStorage.setItem(SOURCE_KEY, source);
}

// Fetch the latest step count from the ThingSpeak channel (single call).
export async function fetchPedometerSteps() {
    const res = await fetch(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=1`
    );
    if (!res.ok) throw new Error(`ThingSpeak error: ${res.status}`);
    const data = await res.json();
    if (!data.feeds?.length) return null;
    const steps = parseInt(data.feeds[0].field1, 10);
    return isNaN(steps) ? null : steps;
}

// Poll ThingSpeak every intervalMs, calling onSteps(steps) each tick.
// Returns a cleanup function (call it to stop polling).
export function subscribeToPedometer(onSteps, intervalMs = 3000) {
    const tick = async () => {
        try {
            const steps = await fetchPedometerSteps();
            onSteps(steps);
        } catch {
            onSteps(null);
        }
    };
    tick(); // immediate first call
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
}
